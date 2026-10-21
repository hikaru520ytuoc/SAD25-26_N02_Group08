from pathlib import Path
root=Path(__file__).resolve().parents[1]
src=(root/'src/source_original.c').read_text()
for version in ['v0','v1']:
    out=[]; active=True; inside=False
    for line in src.splitlines():
        t=line.strip()
        if t == '#ifdef DEMO_VULNERABLE': inside=True;active=(version=='v0');continue
        if t == '#ifndef DEMO_VULNERABLE': inside=True;active=(version=='v1');continue
        if t == '#else' and inside:active=not active;continue
        if t == '#endif' and inside:inside=False;active=True;continue
        if active:out.append(line)
    banner=f'/* {version}: {"co chu dich co loi, chi de thu nghiem" if version=="v0" else "da sua"}. Cung mot chuong trinh thesis_grade_parser. */\n'
    (root/f'src/thesis_grade_parser_{version}.c').write_text(banner+'\n'.join(out)+'\n')
    print(f'{version}: {len(out)} source lines')
