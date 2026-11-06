"""Fetch credited demo imagery; synthesize an original performance of a public domain excerpt."""
import concurrent.futures, json, math, pathlib, struct, urllib.parse, urllib.request, wave, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[1] / "public" / "assets"
ROOT.mkdir(parents=True, exist_ok=True)
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "SelectusPrototype/1.0"})
    with urllib.request.urlopen(req, timeout=50) as response: return response.read()
photos = {
    "hero": "1470071459604-3b5ec3a7fe05", "forest": "1448375240586-882707db888b",
    "garden": "1416879595882-3373a0480b5b", "ocean": "1500530855697-b586d89ba3ee",
    "train": "1474487548417-781cb71495f3", "cinema": "1489599849927-2ee91cede3ba",
    "book-1": "1507842217343-583bb7270b66", "book-2": "1491841550275-ad7854e35ca6",
    "piano": "1520523839897-bd0b52f945a0", "music-2": "1511379938547-c1f69419868d",
    "music-3": "1519681393784-d120267933ba",
    "library": "1507842217343-583bb7270b66",
}
credits = []
def photo(item):
    name, photoid = item
    url = "https://images.unsplash.com/photo-" + photoid + "?auto=format&fit=crop&w=" + ("1920" if name == "hero" else "900") + "&q=85"
    path = ROOT / (name + ".jpg")
    if not path.exists(): path.write_bytes(get(url))
    return {"file": path.name, "source": url, "download": url, "license": "Unsplash License", "use": "Fotografia de ambientação; não representa a obra catalogada."}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    for future in concurrent.futures.as_completed([pool.submit(photo, x) for x in photos.items()]):
        try: credits.append(future.result()); print("photo", credits[-1]["file"], flush=True)
        except Exception as e: print("PHOTO ERROR", e, flush=True)
def wiki(name, title):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action":"query", "titles":title, "prop":"pageimages", "format":"json", "pithumbsize":1200})
    page = next(iter(json.loads(get(url))["query"]["pages"].values()))
    image = page["thumbnail"]["source"]
    (ROOT / (name + ".jpg")).write_bytes(get(image))
    credits.append({"file":name + ".jpg", "source":"https://commons.wikimedia.org/wiki/File:" + page["pageimage"], "license":"Public domain; original artwork, faithful reproduction", "use":title})
for name,title in [("art-1","A Sunday Afternoon on the Island of La Grande Jatte"),("art-2","Bedroom in Arles"),("art-3","Water Lilies (Monet series)"),("art-4","The Great Wave off Kanagawa"),("moon","A Trip to the Moon"),("church","The Return of the Prodigal Son (Rembrandt)")]:
    try: wiki(name,title); print("art", name, flush=True)
    except Exception as e: print("ART ERROR", name, str(e), flush=True)
try:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action":"query","titles":"File:Le Voyage dans la Lune (1902).webm","prop":"videoinfo","viprop":"url|derivatives","format":"json"})
    data = json.loads(get(url))
    info = next(iter(data["query"]["pages"].values()))["videoinfo"][0]
    choices = info.get("derivatives", [])
    choice = next((x for x in choices if "240p" in x.get("transcodekey","")), None)
    if choice:
        raw = ROOT / "moon-source.webm"; raw.write_bytes(get(choice["src"]))
        subprocess.run(["ffmpeg","-y","-i",str(raw),"-t","65","-an","-vf","scale=640:-2","-c:v","libx264","-preset","fast","-crf","25","-movflags","+faststart",str(ROOT/"moon.mp4")], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        raw.unlink()
        subprocess.run(["ffmpeg","-y","-ss","30","-i",str(ROOT/"moon.mp4"),"-frames:v","1",str(ROOT/"moon.jpg")],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for credit in credits:
            if credit["file"]=="moon.jpg": credit.update(source="https://commons.wikimedia.org/wiki/File:Le_Voyage_dans_la_Lune_(1902).webm",use="Frame from the original film, used as cover")
        credits.append({"file":"moon.mp4","source":"https://commons.wikimedia.org/wiki/File:Le_Voyage_dans_la_Lune_(1902).webm","license":"PD-old-auto-expired; original without added score","use":"First 65 seconds, muted excerpt"})
        print("video ready",flush=True)
    else: print("VIDEO no derivative",json.dumps(choices)[:1200],flush=True)
except Exception as e: print("VIDEO ERROR", str(e), flush=True)
rate = 22050; step = .25
chords = [[60,64,67,72,76,67,72,76],[60,62,69,74,77,69,74,77],[59,62,67,74,77,67,74,77],[60,64,67,72,76,67,72,76]]
notes = [n for chord in chords for n in chord*2]
samples = [0.0] * int((len(notes)*step+3)*rate)
for k,n in enumerate(notes):
    freq = 440 * 2**((n-69)/12)
    for j in range(int(2.5*rate)):
        t=j/rate; envelope=min(t/.008,1)*math.exp(-t*3.1)
        value=(math.sin(2*math.pi*freq*t)+.25*math.sin(4*math.pi*freq*t)+.1*math.sin(6*math.pi*freq*t))*envelope*.22
        samples[int(k*step*rate)+j] += value
with wave.open(str(ROOT/"prelude.wav"),"wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(rate)
    f.writeframes(b"".join(struct.pack("<h",int(max(-1,min(1,x)) * 32767)) for x in samples))
credits.append({"file":"prelude.wav","source":"https://imslp.org/wiki/Prelude_and_Fugue_in_C_major,_BWV_846_(Bach,_Johann_Sebastian)","license":"Public domain composition; original synthesized performance dedicated to CC0","use":"Four opening measures of the prelude; synthesized excerpt"})
try:
    css=get("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap").decode()
    import re
    urls=re.findall(r"url\((https://[^)]+)\)",css)
    for i,url in enumerate(urls):
        ext="woff2" if ".woff2" in url else "ttf"
        path="manrope-"+str(i)+"."+ext; (ROOT/path).write_bytes(get(url)); css=css.replace(url,"/assets/"+path)
    (ROOT/"fonts.css").write_text(css)
except Exception as e: print("FONT ERROR",e,flush=True)
(ROOT/"credits.json").write_text(json.dumps(credits,ensure_ascii=False,indent=2))
print("assets",len(credits),flush=True)
