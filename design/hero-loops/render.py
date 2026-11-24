# uso: python3 render.py escena offset fps
import asyncio, sys, os, time
from playwright.async_api import async_playwright
name=sys.argv[1]; off=float(sys.argv[2]); fps=int(sys.argv[3]) if len(sys.argv)>3 else 30
out=f"frames/{name}"; os.makedirs(out,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        pg=await b.new_page(viewport={"width":900,"height":900})
        await pg.goto(f"http://localhost:5300/index.html?s={name}"); await pg.wait_for_function("window.ready===true",timeout=120000)
        T=await pg.evaluate("window.T"); n=int(T*fps); t0=time.time()
        for i in range(n):
            await pg.evaluate(f"seek({(off+i/fps)%T})")
            await pg.locator("canvas").screenshot(path=f"{out}/f{i:04d}.png")
        print(name, n, "frames", round(time.time()-t0), "s")
        await b.close()
asyncio.run(main())
