"""CLI for sunan-ibn-majah."""
from __future__ import annotations
import argparse, sys, textwrap, time
from .majah import Majah

VERSION = "1.1.0"
RESET="[0m";BOLD="[1m";DIM="[2m";GREEN="[32m";YELLOW="[33m"
CYAN="[36m";MAGENTA="[35m";BLUE="[34m";RED="[31m";GRAY="[90m"
def _c(col,t): return f"{col}{t}{RESET}"
bold=lambda t:_c(BOLD,t);green=lambda t:_c(GREEN,t);yellow=lambda t:_c(YELLOW,t)
cyan=lambda t:_c(CYAN,t);magenta=lambda t:_c(MAGENTA,t);gray=lambda t:_c(GRAY,t)
red=lambda t:_c(RED,t);dim=lambda t:_c(DIM,t);blue=lambda t:_c(BLUE,t)
DIV=gray("═"*60);DIV2=gray("─"*60)

def _wrap(text,width=72,indent="  "):
    lines=textwrap.wrap(text,width=width-len(indent))
    return "\n".join(indent+l for l in lines)

def _highlight(text,term):
    if not term: return text
    lower=text.lower();tl=term.lower();out=[];i=0
    while i<len(text):
        idx=lower.find(tl,i)
        if idx==-1: out.append(text[i:]); break
        out.append(text[i:idx]); out.append(f"\x1b[1m\x1b[32m{text[idx:idx+len(term)]}{RESET}"); i=idx+len(term)
    return "".join(out)

def _print_hadith(hadith, chapters_map, *, mode="english"):
    chapter=chapters_map.get(hadith.chapterId)
    ch_name = chapter.english if chapter else "Unknown"
    print()
    print(DIV)
    print(f"\n  {_c(CYAN+BOLD, f'Hadith #{hadith.id}')}  {gray('|')}  {bold(f'Chapter: {hadith.chapterId}')} {gray('—')} {yellow(ch_name)}\n")
    if mode in ("arabic","both"):
        if hadith.arabic: print(_wrap(hadith.arabic)); print()
    if mode in ("english","both"):
        if hadith.narrator: print(f"  {bold('Narrator:')} {magenta(hadith.narrator)}\n")
        if hadith.text: print(_wrap(hadith.text)); print()
    print(DIV); print()

def main():
    parser=argparse.ArgumentParser(prog="majah",description="Sunan Ibn Majah CLI",formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("ids",nargs="*",metavar="ID")
    parser.add_argument("--search","-s",metavar="QUERY")
    parser.add_argument("--all",action="store_true")
    parser.add_argument("--chapter","-c",type=int,metavar="ID")
    parser.add_argument("--chapters",action="store_true")
    parser.add_argument("--random","-r",action="store_true")
    parser.add_argument("--info",action="store_true")
    parser.add_argument("--arabic","-a",action="store_true")
    parser.add_argument("--both","-b",action="store_true")
    parser.add_argument("--version","-v",action="store_true")
    args=parser.parse_args()
    mode = "arabic" if args.arabic else "both" if args.both else "english"

    if args.version:
        print(f"\n  {_c(CYAN+BOLD,'sunan-ibn-majah')} {gray('v'+VERSION)}\n"); sys.exit(0)

    print(gray("  Loading..."),end="\r",flush=True)
    try: majah=Majah()
    except Exception as e: print(red(f"\n  ✗ Failed to load: {e}")); sys.exit(1)
    print(" "*20,end="\r")
    chapters_map={c.id:c for c in majah.chapters}

    if args.info:
        print(f"\n{DIV}\n  {_c(CYAN+BOLD,'Sunan Ibn Majah')}\n{DIV}\n")
        print(f"  {bold('Title:')}        {majah.metadata.english.get('title','')}")
        print(f"  {bold('Author:')}       {majah.metadata.english.get('author','')}")
        print(f"  {bold('Total Hadiths:')} {yellow(str(len(majah)))}")
        print(f"  {bold('Chapters:')}     {yellow(str(len(majah.chapters)))}\n{DIV}\n")
        sys.exit(0)

    if args.chapters:
        print(f"\n{DIV}\n  {_c(CYAN+BOLD,'Chapters')} {gray('—')} {bold('Sunan Ibn Majah')}\n{DIV}\n")
        for c in majah.chapters: print(f"  {_c(CYAN+BOLD,'#'+str(c.id).ljust(5))} {c.english}")
        print(f"\n{DIV}\n"); sys.exit(0)

    if args.random:
        _print_hadith(majah.getRandom(),chapters_map,mode=mode); sys.exit(0)

    if args.chapter is not None:
        hadiths=majah.getByChapter(args.chapter); chapter=chapters_map.get(args.chapter)
        if not hadiths: print(yellow(f"\n  No hadiths found for chapter {args.chapter}.\n")); sys.exit(0)
        ch_name=chapter.english if chapter else "Unknown"
        print(f"\n{DIV}\n  {_c(CYAN+BOLD,f'Chapter {args.chapter}')} {gray('—')} {bold(ch_name)}  {gray(f'({len(hadiths)} hadiths)')}\n{DIV}")
        for h in hadiths:
            print(f"\n  {_c(CYAN+BOLD,f'Hadith #{h.id}')}"); print(f"  {bold('Narrator:')} {magenta(h.narrator)}")
            print(_wrap(h.text)); print("\n"+DIV2)
        print(""); sys.exit(0)

    if args.search:
        t0=time.time(); results=majah.search(args.search); elapsed=int((time.time()-t0)*1000)
        print(f"\n{DIV}"); print(f"  {bold('Search:')} {yellow(f'{chr(34)}{args.search}{chr(34)}')}  {gray('—')}  {_c(CYAN+BOLD,str(len(results))+' results')}  {gray(f'({elapsed}ms)')}"); print(DIV)
        if not results: print(yellow(f'\n  No results for "{args.search}"\n')); sys.exit(0)
        limit=len(results) if args.all else min(5,len(results))
        for i,h in enumerate(results[:limit]):
            ch=chapters_map.get(h.chapterId); ch_name=ch.english if ch else "Unknown"
            print(f"\n  {_c(CYAN+BOLD,'#'+str(i+1))}  {bold('Hadith '+str(h.id))}  {gray('|')}  {bold('Chapter: '+str(h.chapterId))} {gray('—')} {yellow(ch_name)}")
            print(f"  {bold('Narrator:')} {magenta(_highlight(h.narrator,args.search))}")
            print(_wrap(_highlight(h.text,args.search))); print("\n"+DIV2)
        if not args.all and len(results)>5:
            print(f"\n  {dim('Showing')} {_c(CYAN+BOLD,'5')} {dim('of')} {_c(CYAN+BOLD,str(len(results)))} {dim('results.')}  {yellow('Run with --all to see all results')}")
            print(f"  {gray(f'majah --search "{args.search}" --all')}\n")
        sys.exit(0)

    if args.ids:
        # Two numeric args = chapter + position
        if len(args.ids)==2:
            try: chapter_id,n=int(args.ids[0]),int(args.ids[1])
            except ValueError: parser.print_help(); sys.exit(1)
            in_chapter=majah.getByChapter(chapter_id)
            if not in_chapter: print(yellow(f"\n  No hadiths in chapter {chapter_id}.\n")); sys.exit(1)
            h=in_chapter[n-1] if 1<=n<=len(in_chapter) else None
            if not h: print(yellow(f"\n  No hadith #{n} in chapter {chapter_id}.\n")); sys.exit(1)
            _print_hadith(h,chapters_map,mode=mode); sys.exit(0)
        # Single numeric arg = hadith ID
        try: hadith_id=int(args.ids[0])
        except ValueError: print(yellow(f"\n  Unknown command: {args.ids[0]}. Run majah --help\n")); sys.exit(1)
        h=majah.get(hadith_id)
        if not h: print(yellow(f"\n  Hadith not found: {hadith_id}\n")); sys.exit(1)
        _print_hadith(h,chapters_map,mode=mode); sys.exit(0)

    parser.print_help()

if __name__=="__main__":
    main()
