/* v1: da sua. Cung mot chuong trinh thesis_grade_parser. */
/* One target program, two builds: DEMO_VULNERABLE and patched (default).
 * For a coursework sandbox ONLY. Never integrate the vulnerable build into a server.
 * Supported CSV subset: six unquoted fields; commas inside fields are not supported.
 */
#include <errno.h>
#include <inttypes.h>
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "parser_config.h"

typedef struct {
    char student_id[STUDENT_ID_BYTES];
    char student_name[STUDENT_NAME_BYTES];
    char project_id[PROJECT_ID_BYTES];
    float supervisor_score;
    float reviewer_score;
    float council_score;
} GradeRecord;

static GradeRecord records[MAX_RECORDS];
static size_t record_count = 0;

static void chomp(char *s) {
    size_t n = strlen(s);
    while (n > 0 && (s[n - 1] == '\n' || s[n - 1] == '\r')) s[--n] = '\0';
}

static int split_six(char *s, char *parts[6]) {
    int count = 0;
    parts[count++] = s;
    for (char *p = s; *p; ++p) {
        if (*p == ',') {
            if (count >= 6) return 0;
            *p = '\0';
            parts[count++] = p + 1;
        }
    }
    return count == 6;
}

static int parse_score(const char *input, float *out) {
    char *end = NULL;
    errno = 0;
    float value = strtof(input, &end);
    if (input == end || *end != '\0' || errno == ERANGE ||
        !isfinite(value) || value < SCORE_MIN || value > SCORE_MAX)
        return 0;
    *out = value;
    return 1;
}

static int copy_field(char *dst, size_t capacity, const char *src) {
    size_t n = strlen(src);
    if (!n || n >= capacity) return 0;
    memcpy(dst, src, n + 1);
    return 1;
}

static int parse_record(char *line, GradeRecord *out) {
    char *fields[6];
    if (!split_six(line, fields)) return 0;
    GradeRecord *scratch = malloc(sizeof(*scratch));
    if (!scratch) return 0;
    memset(scratch, 0, sizeof(*scratch));

    /* Controlled overflow demo when the name or ID exceeds field capacity. */
    if (!copy_field(scratch->student_id, sizeof(scratch->student_id), fields[0]) ||
        !copy_field(scratch->student_name, sizeof(scratch->student_name), fields[1]) ||
        !copy_field(scratch->project_id, sizeof(scratch->project_id), fields[2])) {
        free(scratch);
        return 0;
    }
    if (!parse_score(fields[3], &scratch->supervisor_score) ||
        !parse_score(fields[4], &scratch->reviewer_score) ||
        !parse_score(fields[5], &scratch->council_score)) {
        free(scratch);
        return 0;
    }
    *out = *scratch;
    free(scratch);
    return 1;
}

static int store_record(GradeRecord record) {
    if (record_count >= MAX_RECORDS) return 0;
    records[record_count++] = record; /* CWE-787 in vulnerable mode, if >=100 */
    return 1;
}

static int estimate_allocation(uint32_t count) {
    /* Simulated 32-bit memory-size counter: no memory allocation happens here. */
    if (count > UINT32_MAX / sizeof(GradeRecord)) {
        fprintf(stderr, "REJECT: 32-bit allocation size would overflow\n");
        return 2;
    }
    printf("Estimated uint32 bytes: %" PRIu32 "\n",
           (uint32_t)(count * sizeof(GradeRecord)));
    return 0;
}

static int read_csv(const char *path) {
    FILE *fp = fopen(path, "r");
    if (!fp) { perror("fopen"); return 2; }
    char line[MAX_LINE_BYTES];
    if (!fgets(line, sizeof(line), fp)) {
        fclose(fp); fprintf(stderr, "REJECT: empty file\n"); return 2;
    }
    chomp(line);
    if (strcmp(line, CSV_HEADER) != 0) {
        fclose(fp); fprintf(stderr, "REJECT: CSV header\n"); return 2;
    }
    size_t row = 1;
    while (fgets(line, sizeof(line), fp)) {
        ++row;
        if (!strchr(line, '\n') && !feof(fp)) {
            fclose(fp); fprintf(stderr, "REJECT: CSV line too long at row %zu\n", row);
            return 2;
        }
        chomp(line);
        GradeRecord current;
        if (!parse_record(line, &current)) {
            fclose(fp); fprintf(stderr, "REJECT: invalid record at row %zu\n", row);
            return 2;
        }
        if (!store_record(current)) {
            fclose(fp); fprintf(stderr, "REJECT: >%d records\n", MAX_RECORDS);
            return 2;
        }
    }
    fclose(fp);
    printf("ACCEPT: %zu records\n", record_count);
    return 0;
}

int main(int argc, char **argv) {
    if (argc == 3 && strcmp(argv[1], "--estimate") == 0) {
        char *end = NULL;
        errno = 0;
        unsigned long long n = strtoull(argv[2], &end, 10);
        if (errno || end == argv[2] || *end || n > UINT32_MAX) {
            fprintf(stderr, "REJECT: invalid count\n"); return 2;
        }
        return estimate_allocation((uint32_t)n);
    }
    if (argc != 2) {
        fprintf(stderr, "Usage: %s grades.csv | --estimate n\n", argv[0]);
        return 2;
    }
    return read_csv(argv[1]);
}
