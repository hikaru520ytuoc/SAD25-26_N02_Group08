/* Safe standalone CSV grade parser for untrusted input. No database writes.
 * License: educational demo. Compile with C11, no vulnerable code linked.
 * Wire contract: stdin bytes -> one JSON value on stdout, exit 0 or 2.
 * Exact six-column, unquoted CSV subset. Reject NUL and invalid UTF-8.
 */
#define _GNU_SOURCE
#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <inttypes.h>
#include <locale.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <ctype.h>

#define LINE_CAP 512
#define MAX_RECORDS 100
#define MAX_UPLOAD (LINE_CAP * (MAX_RECORDS + 1))
#define HEADER "student_id,student_name,project_id,supervisor_score,reviewer_score,council_score"

typedef struct {
  char sid[16], name[64], pid[16];
  float sup, rev, council;
} Grade;

static Grade rows[MAX_RECORDS];
static const char *const field_names[6] = {
  "student_id","student_name","project_id","supervisor_score","reviewer_score","council_score"
};

static void json_string(const char *s) {
  putchar('"');
  for (const unsigned char *p=(const unsigned char *)s; *p; p++) {
    if (*p=='"' || *p=='\\') { putchar('\\'); putchar(*p); }
    else if (*p<32) printf("\\u%04x", (unsigned)*p);
    else putchar(*p);
  }
  putchar('"');
}
static int reject(size_t row, const char *field, const char *message) {
  fputs("{\"ok\":false,\"row\":", stdout);
  printf("%zu,\"field\":", row);
  json_string(field); fputs(",\"error\":", stdout); json_string(message);
  fputs("}\n", stdout);
  return 2;
}
static int utf8_valid(const unsigned char *s) {
  while(*s){
    if (*s<128) { if (*s<32 || *s==127) return 0; s++; continue; }
    unsigned a=*s;
    if (a>=0xc2 && a<=0xdf) { if ((s[1]&0xc0)!=0x80) return 0; s+=2; continue; }
    if (a>=0xe0 && a<=0xef) {
      if (!s[1] || !s[2]) return 0;
      if ((s[1]&0xc0)!=0x80 || (s[2]&0xc0)!=0x80) return 0;
      if ((a==0xe0 && s[1]<0xa0) || (a==0xed && s[1]>=0xa0)) return 0;
      s+=3; continue;
    }
    if (a>=0xf0 && a<=0xf4) {
      if (!s[1]||!s[2]||!s[3]) return 0;
      if ((s[1]&0xc0)!=0x80||(s[2]&0xc0)!=0x80||(s[3]&0xc0)!=0x80) return 0;
      if ((a==0xf0 && s[1]<0x90)||(a==0xf4 && s[1]>=0x90)) return 0;
      s+=4; continue;
    }
    return 0;
  }
  return 1;
}
static int parse_score(const char *s, float *dest){
  if(!s || !*s || isspace((unsigned char)*s)) return 0;
  for (const unsigned char *p=(const unsigned char*)s; *p; p++) {
    if (*p>127 || isspace(*p)) return 0;
  }
  char *end=NULL; errno=0;
  float v=strtof(s,&end);
  if(s==end || *end!='\0' || errno==ERANGE || !isfinite(v) || v<0 || v>10) return 0;
  *dest=v;return 1;
}
static int copy_id(char *dest, size_t cap, const char *s){
  size_t n=strlen(s);
  if(n==0 || n>=cap || !utf8_valid((const unsigned char *)s)) return 0;
  /* IDs are ASCII-only to avoid Unicode confusables in cross-service identifiers. */
  for(size_t i=0;i<n;i++) if(!((s[i]>='A' && s[i]<='Z')||(s[i]>='a' && s[i]<='z')||(s[i]>='0' && s[i]<='9')||s[i]=='_'||s[i]=='-')) return 0;
  memcpy(dest,s,n+1); return 1;
}
static int copy_name(char *dest,size_t cap,const char *s){
  size_t n=strlen(s);
  if(n==0||n>=cap||!utf8_valid((const unsigned char*)s))return 0;
  for(size_t i=0;i<n;i++)if(s[i]=='"') return 0; /* simple CSV only */
  memcpy(dest,s,n+1);return 1;
}
static int split(char *s, char *parts[6]){
  int n=1;parts[0]=s;
  for(char *p=s; *p; p++) if(*p==',') {
    if(n>=6)return 0;
    *p='\0';parts[n++]=p+1;
  }
  return n==6;
}
static int process_line(char *s,size_t row, Grade *g){
  char *p[6];
  if(!split(s,p))return reject(row,"csv","Expected exactly 6 unquoted fields");
  if(!copy_id(g->sid,sizeof(g->sid),p[0]))return reject(row,field_names[0],"Invalid ID or exceeds 15 bytes");
  if(!copy_name(g->name,sizeof(g->name),p[1]))return reject(row,field_names[1],"Invalid UTF-8 name or exceeds 63 bytes");
  if(!copy_id(g->pid,sizeof(g->pid),p[2]))return reject(row,field_names[2],"Invalid project ID or exceeds 15 bytes");
  if(!parse_score(p[3],&g->sup))return reject(row,field_names[3],"Score must be finite in [0,10]");
  if(!parse_score(p[4],&g->rev))return reject(row,field_names[4],"Score must be finite in [0,10]");
  if(!parse_score(p[5],&g->council))return reject(row,field_names[5],"Score must be finite in [0,10]");
  return 0;
}
int main(void){
  setlocale(LC_NUMERIC,"C");
  unsigned char raw[MAX_UPLOAD+2];
  size_t bytes=fread(raw,1,sizeof(raw),stdin);
  if (ferror(stdin)) return reject(1,"csv","Read error");
  if (bytes>MAX_UPLOAD) return reject(1,"csv","Upload too large");
  if (memchr(raw,0,bytes)) return reject(1,"csv","NUL byte forbidden");
  FILE *source=fmemopen(raw,bytes,"r");
  if (!source) return reject(1,"csv","Cannot read buffered CSV");
  char line[LINE_CAP];size_t row=0,n=0,total=0;
  while(fgets(line,sizeof(line),source)){
    row++;size_t len=strlen(line);
    if(!memchr(line,'\n',len) && !feof(source)){
      int ch=fgetc(source);
      if(ch!=EOF) return reject(row,"csv","Line exceeds 511 bytes");
    }
    total+=len;
    if(total>MAX_UPLOAD)return reject(row,"csv","Upload too large");
    if(len&&line[len-1]=='\n')line[--len]='\0';
    if(len&&line[len-1]=='\r')line[--len]='\0';
    if(row==1){
      const char *h=line;
      if(len>=3&&(unsigned char)line[0]==0xef&&(unsigned char)line[1]==0xbb&&(unsigned char)line[2]==0xbf)h+=3;
      if(strcmp(h,HEADER))return reject(row,"header","CSV header does not match exact six fields");
      continue;
    }
    if(n>=MAX_RECORDS)return reject(row,"csv","More than 100 records");
    if(!len)return reject(row,"csv","Empty record");
    Grade g={0};int status=process_line(line,row,&g);if(status)return status;
    for(size_t i=0;i<n;i++)if(strcmp(rows[i].sid,g.sid)==0)return reject(row,"student_id","Duplicate student_id in upload");
    rows[n++]=g;
  }
  if(ferror(source))return reject(row,"csv","Stream read failed");
  fclose(source);
  if(row==0)return reject(1,"csv","Empty file");
  if(n==0)return reject(1,"csv","No data records");
  printf("{\"ok\":true,\"count\":%zu,\"records\":[",n);
  for(size_t i=0;i<n;i++){
    const Grade *g=&rows[i];if(i)putchar(',');
    fputs("{\"student_id\":",stdout);json_string(g->sid);
    fputs(",\"student_name\":",stdout);json_string(g->name);
    fputs(",\"project_id\":",stdout);json_string(g->pid);
    printf(",\"supervisor_score\":%.8g,\"reviewer_score\":%.8g,\"council_score\":%.8g}",g->sup,g->rev,g->council);
  }
  fputs("]}\n",stdout);return 0;
}
