#!/usr/bin/env python3
"""Generate original TOEIC-like listening MP3s with edge-tts (multi-accent)."""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "public" / "audio"
IMAGES = ROOT / "public" / "images" / "part1"
DATA_OUT = ROOT / "src" / "data" / "listening" / "generated.json"

VOICES = {
    "US-F1": "en-US-JennyNeural",
    "US-M1": "en-US-GuyNeural",
    "US-F2": "en-US-AriaNeural",
    "UK-F1": "en-GB-SoniaNeural",
    "UK-M1": "en-GB-RyanNeural",
    "AU-F1": "en-AU-NatashaNeural",
    "AU-M1": "en-AU-WilliamMultilingualNeural",
}

ACCENT = {
    "US-F1": "미국",
    "US-M1": "미국",
    "US-F2": "미국",
    "UK-F1": "영국",
    "UK-M1": "영국",
    "AU-F1": "호주",
    "AU-M1": "호주",
}


def letter_prefix(i: int) -> str:
    return f"({chr(65 + i)}) "


async def save(text: str, voice_key: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICES[voice_key])
    await communicate.save(str(path))


async def save_concat(segments: list[tuple[str, str]], path: Path, gap_ms: int = 600) -> None:
    """Concatenate segments with short silence gaps via sequential writes + pydub if available.
    Fallback: one continuous string with pauses as '... ' for TTS natural pause.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    # Prefer single Communicate with SSML-like pauses using punctuation
    # Build multi-voice by generating parts then concatenating bytes with ffmpeg if present
    parts: list[Path] = []
    tmp_dir = path.parent / "_tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    for idx, (text, voice_key) in enumerate(segments):
        part = tmp_dir / f"{path.stem}_{idx}.mp3"
        await save(text, voice_key, part)
        parts.append(part)

    # Try ffmpeg concat
    import shutil
    import subprocess

    if shutil.which("ffmpeg"):
        list_file = tmp_dir / f"{path.stem}_list.txt"
        # insert silence between
        silence = tmp_dir / "silence.mp3"
        if not silence.exists():
            subprocess.run(
                [
                    "ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono",
                    "-t", str(gap_ms / 1000), "-q:a", "9", "-acodec", "libmp3lame", str(silence),
                ],
                check=True,
                capture_output=True,
            )
        with list_file.open("w") as f:
            for i, p in enumerate(parts):
                f.write(f"file '{p.resolve()}'\n")
                if i < len(parts) - 1:
                    f.write(f"file '{silence.resolve()}'\n")
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file), "-c", "copy", str(path)],
            check=True,
            capture_output=True,
        )
    else:
        # Naive byte concat (works for mp3 streaming frames often enough for practice)
        with path.open("wb") as out:
            for p in parts:
                out.write(p.read_bytes())

    for p in parts:
        p.unlink(missing_ok=True)


# ---------- CONTENT ----------

PART1 = [
    {
        "id": 1,
        "image": "part1/p01.jpg",
        "imageAlt": "People sitting around a conference table in an office",
        "imageSeed": "office-meeting-01",
        "statements": [
            ("A woman is giving a presentation to colleagues.", "US-F1"),
            ("People are sitting around a conference table.", "UK-M1"),
            ("A man is watering office plants.", "AU-F1"),
            ("Workers are packing boxes near a door.", "US-M1"),
        ],
        "answer": 1,
        "explanationKo": "사진에는 회의 테이블에 앉아 있는 사람들이 보입니다. B가 정답입니다. A의 발표 장면, C의 물주기, D의 상자 포장은 보이지 않습니다.",
    },
    {
        "id": 2,
        "image": "part1/p02.jpg",
        "imageAlt": "A person walking outdoors on a path",
        "imageSeed": "walking-outdoors-02",
        "statements": [
            ("Someone is walking along a path outdoors.", "AU-M1"),
            ("A cyclist is repairing a bicycle.", "US-F2"),
            ("Children are playing in a fountain.", "UK-F1"),
            ("A vendor is selling newspapers.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "야외 길을 걷고 있는 사람이 보입니다. A가 정답입니다.",
    },
    {
        "id": 3,
        "image": "part1/p03.jpg",
        "imageAlt": "Cafe or restaurant interior with tables",
        "imageSeed": "cafe-tables-03",
        "statements": [
            ("Customers are waiting in a long ticket line.", "UK-M1"),
            ("A chef is flipping pancakes on a grill.", "US-F1"),
            ("Tables and chairs are arranged in a dining area.", "AU-F1"),
            ("A cashier is counting coins at a register.", "US-M1"),
        ],
        "answer": 2,
        "explanationKo": "식사 공간에 테이블과 의자가 배치된 모습이 보입니다. C가 정답입니다.",
    },
    {
        "id": 4,
        "image": "part1/p04.jpg",
        "imageAlt": "Modern building exterior",
        "imageSeed": "building-exterior-04",
        "statements": [
            ("Construction workers are installing a roof.", "US-M1"),
            ("A large building stands against the sky.", "UK-F1"),
            ("Gardeners are planting flowers by a fence.", "AU-M1"),
            ("A truck is unloading furniture.", "US-F2"),
        ],
        "answer": 1,
        "explanationKo": "하늘을 배경으로 큰 건물이 보입니다. B가 정답입니다.",
    },
    {
        "id": 5,
        "image": "part1/p05.jpg",
        "imageAlt": "Airport or travel terminal scene",
        "imageSeed": "airport-travel-05",
        "statements": [
            ("Passengers are standing with luggage in a terminal.", "US-F1"),
            ("A pilot is boarding a small airplane alone.", "UK-M1"),
            ("Travelers are camping beside a runway.", "AU-F1"),
            ("A taxi driver is washing a car.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "터미널에서 짐과 함께 서 있는 승객들이 보입니다. A가 정답입니다.",
    },
    {
        "id": 6,
        "image": "part1/p06.jpg",
        "imageAlt": "Person reading books in a quiet space",
        "imageSeed": "library-books-06",
        "statements": [
            ("A librarian is stacking empty cardboard boxes.", "AU-M1"),
            ("Students are performing on a stage.", "US-F2"),
            ("Someone is reading near shelves of books.", "UK-F1"),
            ("A clerk is sweeping the hallway.", "US-M1"),
        ],
        "answer": 2,
        "explanationKo": "책장 근처에서 책을 읽고 있는 사람이 보입니다. C가 정답입니다.",
    },
    {
        "id": 7,
        "image": "part1/p07.jpg",
        "imageAlt": "Kitchen or food preparation area",
        "imageSeed": "kitchen-food-07",
        "statements": [
            ("Food is being prepared in a kitchen.", "US-F1"),
            ("A waiter is setting outdoor picnic tables.", "UK-M1"),
            ("Guests are dancing in a banquet hall.", "AU-F1"),
            ("A delivery person is ringing a doorbell.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "주방에서 음식이 준비되는 장면입니다. A가 정답입니다.",
    },
    {
        "id": 8,
        "image": "part1/p08.jpg",
        "imageAlt": "People exercising or relaxing in a park",
        "imageSeed": "park-exercise-08",
        "statements": [
            ("A lifeguard is sitting beside an indoor pool.", "UK-F1"),
            ("People are enjoying outdoor activities in a park.", "AU-M1"),
            ("A musician is tuning a piano indoors.", "US-F2"),
            ("Shoppers are pushing carts in a supermarket.", "US-M1"),
        ],
        "answer": 1,
        "explanationKo": "공원에서 야외 활동을 즐기는 사람들이 보입니다. B가 정답입니다.",
    },
    {
        "id": 9,
        "image": "part1/p09.jpg",
        "imageAlt": "Person working at a computer desk",
        "imageSeed": "desk-computer-09",
        "statements": [
            ("A technician is repairing an elevator.", "AU-F1"),
            ("A woman is painting a mural on a wall.", "UK-M1"),
            ("Someone is working at a desk with a computer.", "US-F1"),
            ("Employees are lining up at a cafeteria.", "US-M1"),
        ],
        "answer": 2,
        "explanationKo": "책상에서 컴퓨터를 사용하며 일하는 모습이 보입니다. C가 정답입니다.",
    },
    {
        "id": 10,
        "image": "part1/p10.jpg",
        "imageAlt": "Busy city street with vehicles or pedestrians",
        "imageSeed": "city-street-10",
        "statements": [
            ("Vehicles and pedestrians are on a city street.", "UK-F1"),
            ("Farmers are harvesting crops in a field.", "AU-M1"),
            ("A couple is boarding a cruise ship.", "US-F2"),
            ("Workers are assembling toys in a factory.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "도시 거리에 차량과 보행자가 있습니다. A가 정답입니다.",
    },
]

PART2 = [
    {
        "id": 1,
        "question": ("Where is the nearest post office?", "US-F1"),
        "responses": [
            ("It's across from the bank on Main Street.", "UK-M1"),
            ("I mailed the package yesterday.", "AU-F1"),
            ("The meeting starts at three.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "장소(Where) 질문에는 위치를 알려 주는 A가 적절합니다. B는 과거 행동, C는 시간 정보로 동문서답입니다.",
    },
    {
        "id": 2,
        "question": ("Would you like some coffee?", "UK-F1"),
        "responses": [
            ("Yes, I'd love a cup, thank you.", "US-M1"),
            ("The machine is near the window.", "AU-M1"),
            ("Coffee is grown in warm climates.", "US-F2"),
        ],
        "answer": 0,
        "explanationKo": "제안(Would you like~)에는 수락/거절이 자연스럽습니다. A가 정답입니다.",
    },
    {
        "id": 3,
        "question": ("Who will present the sales report?", "AU-F1"),
        "responses": [
            ("The report is twenty pages long.", "UK-M1"),
            ("Ms. Chen from the marketing team.", "US-F1"),
            ("I'll print extra copies later.", "US-M1"),
        ],
        "answer": 1,
        "explanationKo": "Who 질문에는 사람(이름/역할)이 답입니다. B가 정답입니다.",
    },
    {
        "id": 4,
        "question": ("When does the train leave for Boston?", "US-M1"),
        "responses": [
            ("Platform four is closed today.", "AU-F1"),
            ("It departs at half past nine.", "UK-F1"),
            ("Boston is a popular destination.", "US-F2"),
        ],
        "answer": 1,
        "explanationKo": "When 질문에는 시간이 필요합니다. B가 정답입니다.",
    },
    {
        "id": 5,
        "question": ("How long have you worked here?", "UK-M1"),
        "responses": [
            ("For about three years now.", "AU-M1"),
            ("I work in the accounting department.", "US-F1"),
            ("The office opens at eight.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "How long(기간)에는 for/since 등 기간 답이 옵니다. A가 정답입니다.",
    },
    {
        "id": 6,
        "question": ("Could you send me the invoice?", "AU-M1"),
        "responses": [
            ("Of course. I'll email it this afternoon.", "US-F2"),
            ("The invoice lists several items.", "UK-F1"),
            ("Accounting is on the second floor.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "요청에는 승낙+행동이 자연스럽습니다. A가 정답입니다.",
    },
    {
        "id": 7,
        "question": ("Is this seat taken?", "US-F1"),
        "responses": [
            ("No, please go ahead and sit down.", "UK-M1"),
            ("The seats were redesigned last year.", "AU-F1"),
            ("I prefer window seats on flights.", "US-M1"),
        ],
        "answer": 0,
        "explanationKo": "Yes/No 질문에 직접 답하는 A가 적절합니다.",
    },
    {
        "id": 8,
        "question": ("Why was the workshop postponed?", "UK-F1"),
        "responses": [
            ("The workshop covers project management.", "US-F2"),
            ("Because the speaker had a scheduling conflict.", "AU-M1"),
            ("Registration closes next Friday.", "US-M1"),
        ],
        "answer": 1,
        "explanationKo": "Why에는 이유(because~)가 옵니다. B가 정답입니다.",
    },
    {
        "id": 9,
        "question": ("Have you finished reviewing the contract?", "US-M1"),
        "responses": [
            ("Not yet, but I should be done by noon.", "AU-F1"),
            ("Contracts must be signed in ink.", "UK-M1"),
            ("The lawyer's office is downtown.", "US-F1"),
        ],
        "answer": 0,
        "explanationKo": "완료 여부 질문에는 진행 상황 답이 맞습니다. A가 정답입니다.",
    },
    {
        "id": 10,
        "question": ("What's the weather like outside?", "AU-F1"),
        "responses": [
            ("I left my umbrella at home.", "US-M1"),
            ("It's sunny and quite warm today.", "UK-F1"),
            ("The forecast is updated hourly.", "US-F2"),
        ],
        "answer": 1,
        "explanationKo": "날씨 질문에는 현재 날씨 묘사가 답입니다. B가 정답입니다.",
    },
]

PART3 = [
    {
        "id": 1,
        "title": "Office printer problem",
        "speakers": [
            ("Hi, Mark. Is the printer on the third floor working? I need to print the client packets.", "US-F1"),
            ("I'm afraid not. It jammed again this morning. IT said they'll replace the toner after lunch.", "UK-M1"),
            ("Okay. I'll use the one near reception for now. Could you let me know when it's fixed?", "US-F1"),
            ("Sure. I'll send you a quick message.", "UK-M1"),
        ],
        "questions": [
            {
                "q": "What is the woman's problem?",
                "choices": [
                    "She lost the client packets.",
                    "The third-floor printer is not working.",
                    "Reception is closed for lunch.",
                    "IT asked her to buy toner.",
                ],
                "answer": 1,
                "explanationKo": "여자가 3층 프린터가 작동하는지 묻고, 남자는 고장(jam)이라고 합니다. 정답은 B입니다.",
            },
            {
                "q": "When will IT replace the toner?",
                "choices": ["This morning", "Before the meeting", "After lunch", "Tomorrow"],
                "answer": 2,
                "explanationKo": "남자가 after lunch에 토너를 교체할 것이라고 말합니다.",
            },
            {
                "q": "What will the woman do in the meantime?",
                "choices": [
                    "Wait until IT arrives",
                    "Call the client",
                    "Use the printer near reception",
                    "Cancel the packets",
                ],
                "answer": 2,
                "explanationKo": "여자가 당분간 reception 근처 프린터를 쓰겠다고 합니다.",
            },
        ],
    },
    {
        "id": 2,
        "title": "Restaurant reservation",
        "speakers": [
            ("Good afternoon. I'd like to reserve a table for Saturday evening.", "AU-F1"),
            ("Certainly. How many people will be in your party?", "US-M1"),
            ("Four adults. Could we have a quiet table near the window if possible?", "AU-F1"),
            ("We can do seven-thirty by the window. May I have a name and phone number?", "US-M1"),
            ("It's Underwood, and my number is five-five-five, zero-one-four-two.", "AU-F1"),
        ],
        "questions": [
            {
                "q": "When does the woman want to dine?",
                "choices": ["Friday lunch", "Saturday evening", "Sunday brunch", "Monday night"],
                "answer": 1,
                "explanationKo": "Saturday evening 예약을 요청합니다.",
            },
            {
                "q": "What special request does she make?",
                "choices": [
                    "A menu in another language",
                    "A birthday cake",
                    "A quiet table near the window",
                    "Free parking validation",
                ],
                "answer": 2,
                "explanationKo": "창문 근처의 조용한 자리를 요청합니다.",
            },
            {
                "q": "What time is available?",
                "choices": ["6:00", "6:30", "7:00", "7:30"],
                "answer": 3,
                "explanationKo": "직원이 seven-thirty(7:30) 창문 자리를 제안합니다.",
            },
        ],
    },
    {
        "id": 3,
        "title": "Project deadline discussion",
        "speakers": [
            ("Tom, do you have a minute? The design files for the brochure still aren't in the shared folder.", "UK-F1"),
            ("Sorry about that. I was waiting on final photos from the vendor. They arrived an hour ago.", "AU-M1"),
            ("Great. Can you upload them before four? Marketing wants to review everything today.", "UK-F1"),
            ("No problem. I'll finish the layout and send a link to the team.", "AU-M1"),
        ],
        "questions": [
            {
                "q": "What has been missing?",
                "choices": [
                    "The marketing schedule",
                    "Design files for a brochure",
                    "Vendor invoices",
                    "A shared password",
                ],
                "answer": 1,
                "explanationKo": "브로슈어 design files가 공유 폴더에 없다고 합니다.",
            },
            {
                "q": "Why was Tom delayed?",
                "choices": [
                    "He was in a meeting all day.",
                    "His computer crashed.",
                    "He was waiting for final photos.",
                    "Marketing changed the deadline.",
                ],
                "answer": 2,
                "explanationKo": "벤더의 final photos를 기다리고 있었다고 합니다.",
            },
            {
                "q": "What does the woman ask Tom to do?",
                "choices": [
                    "Call the vendor again",
                    "Upload the files before four",
                    "Print the brochure",
                    "Cancel the review",
                ],
                "answer": 1,
                "explanationKo": "4시 전에 업로드해 달라고 요청합니다.",
            },
        ],
    },
    {
        "id": 4,
        "title": "Hotel check-in",
        "speakers": [
            ("Hello, I have a reservation under the name Patel.", "US-F2"),
            ("Welcome. I see a room for two nights. Would you prefer a king bed or two queens?", "UK-M1"),
            ("A king bed, please. Also, is the fitness center open early?", "US-F2"),
            ("Yes, it opens at five a.m. Breakfast is served from six-thirty in the lobby cafe.", "UK-M1"),
        ],
        "questions": [
            {
                "q": "How long will the guest stay?",
                "choices": ["One night", "Two nights", "Three nights", "One week"],
                "answer": 1,
                "explanationKo": "직원이 a room for two nights라고 확인합니다.",
            },
            {
                "q": "What bed type does the guest choose?",
                "choices": ["Two twins", "Two queens", "A king", "A sofa bed"],
                "answer": 2,
                "explanationKo": "A king bed, please라고 말합니다.",
            },
            {
                "q": "When does the fitness center open?",
                "choices": ["5:00 a.m.", "6:00 a.m.", "6:30 a.m.", "7:00 a.m."],
                "answer": 0,
                "explanationKo": "헬스장은 five a.m.에 연다고 합니다. 6:30은 조식 시간입니다.",
            },
        ],
    },
    {
        "id": 5,
        "title": "Conference volunteer shift",
        "speakers": [
            ("Are you volunteering at the registration desk tomorrow?", "AU-F1"),
            ("Yes, from nine to noon. After that I'll help in the exhibitor hall.", "US-M1"),
            ("Perfect. Could you bring extra name badges? We ran short yesterday.", "AU-F1"),
            ("I'll pick some up from the supply room this evening.", "US-M1"),
        ],
        "questions": [
            {
                "q": "Where will the man volunteer first?",
                "choices": [
                    "The exhibitor hall",
                    "The supply room",
                    "The registration desk",
                    "The keynote stage",
                ],
                "answer": 2,
                "explanationKo": "아침에 registration desk에서 봉사한다고 합니다.",
            },
            {
                "q": "What does the woman ask him to bring?",
                "choices": ["Water bottles", "Extra name badges", "Floor maps", "Laptops"],
                "answer": 1,
                "explanationKo": "extra name badges를 가져와 달라고 합니다.",
            },
        ],
    },
]

PART4 = [
    {
        "id": 1,
        "title": "Airport gate announcement",
        "voice": "US-F2",
        "script": (
            "Attention passengers on Flight 628 to Seattle. Boarding will begin in fifteen minutes at Gate B12. "
            "Please have your boarding pass and identification ready. Passengers needing assistance or traveling with small children "
            "may board first. We expect to depart on time at 4:40 p.m. Thank you for flying with us."
        ),
        "questions": [
            {
                "q": "What is the destination of the flight?",
                "choices": ["Boston", "Seattle", "Chicago", "Dallas"],
                "answer": 1,
                "explanationKo": "Flight 628 to Seattle이라고 안내합니다.",
            },
            {
                "q": "Where should passengers go?",
                "choices": ["Gate A4", "Gate B12", "Baggage claim C", "Counter 15"],
                "answer": 1,
                "explanationKo": "Gate B12에서 탑승한다고 합니다.",
            },
            {
                "q": "When is departure expected?",
                "choices": ["3:40 p.m.", "4:15 p.m.", "4:40 p.m.", "5:00 p.m."],
                "answer": 2,
                "explanationKo": "4:40 p.m.에 정시 출발 예정이라고 합니다.",
            },
        ],
    },
    {
        "id": 2,
        "title": "Company training reminder",
        "voice": "UK-M1",
        "script": (
            "Hello everyone. This is a reminder that tomorrow's customer service workshop will be held in Conference Room C "
            "from 9 a.m. to noon. Please bring a notebook and your staff ID badge. Lunch will be provided afterward in the cafeteria. "
            "If you cannot attend, notify HR by the end of today so we can offer your seat to someone on the waiting list."
        ),
        "questions": [
            {
                "q": "What event is being announced?",
                "choices": [
                    "A product launch",
                    "A customer service workshop",
                    "An HR interview",
                    "A cafeteria renovation",
                ],
                "answer": 1,
                "explanationKo": "customer service workshop 안내입니다.",
            },
            {
                "q": "Where will the workshop take place?",
                "choices": ["The cafeteria", "Conference Room C", "The lobby", "HR office"],
                "answer": 1,
                "explanationKo": "Conference Room C에서 진행됩니다.",
            },
            {
                "q": "What should employees do if they cannot attend?",
                "choices": [
                    "Email their manager next week",
                    "Leave a note on the door",
                    "Notify HR by the end of today",
                    "Find their own replacement",
                ],
                "answer": 2,
                "explanationKo": "참석 불가 시 오늘 중으로 HR에 알리라고 합니다.",
            },
        ],
    },
    {
        "id": 3,
        "title": "Museum tour introduction",
        "voice": "AU-F1",
        "script": (
            "Good morning, and welcome to the Riverside Art Museum. I'm your guide for today's highlights tour, which lasts about forty minutes. "
            "We'll begin in the modern sculpture gallery, then move to the photography exhibit on the second floor. "
            "Please keep food and drinks outside the galleries, and photography without flash is allowed. "
            "Restrooms are located near the gift shop. Let's get started."
        ),
        "questions": [
            {
                "q": "How long is the tour?",
                "choices": ["20 minutes", "30 minutes", "40 minutes", "60 minutes"],
                "answer": 2,
                "explanationKo": "about forty minutes라고 말합니다.",
            },
            {
                "q": "Where does the tour begin?",
                "choices": [
                    "The gift shop",
                    "The photography exhibit",
                    "The modern sculpture gallery",
                    "The second-floor cafe",
                ],
                "answer": 2,
                "explanationKo": "modern sculpture gallery에서 시작한다고 합니다.",
            },
            {
                "q": "What rule is mentioned about photography?",
                "choices": [
                    "No photography is allowed",
                    "Only staff may take photos",
                    "Flash photography is required",
                    "Photos without flash are allowed",
                ],
                "answer": 3,
                "explanationKo": "플래시 없는 사진 촬영은 허용된다고 합니다.",
            },
        ],
    },
    {
        "id": 4,
        "title": "Weather and traffic update",
        "voice": "US-M1",
        "script": (
            "Here's your mid-day update. Expect cloudy skies this afternoon with a chance of light rain after 3 p.m. Temperatures will stay near 18 degrees Celsius. "
            "On the roads, an accident on Highway 7 near Exit 12 is causing delays of up to twenty minutes for northbound traffic. "
            "Drivers are advised to use Maple Avenue as an alternate route. We'll be back with more at the top of the hour."
        ),
        "questions": [
            {
                "q": "What weather is expected after 3 p.m.?",
                "choices": ["Heavy snow", "Strong winds", "Light rain", "Clear skies"],
                "answer": 2,
                "explanationKo": "3시 이후 light rain 가능성이 있다고 합니다.",
            },
            {
                "q": "What is causing traffic delays?",
                "choices": [
                    "Road construction downtown",
                    "An accident on Highway 7",
                    "A parade on Maple Avenue",
                    "A bridge closure",
                ],
                "answer": 1,
                "explanationKo": "Highway 7 Exit 12 근처 사고 때문입니다.",
            },
            {
                "q": "What alternate route is suggested?",
                "choices": ["Highway 9", "Oak Street", "Maple Avenue", "Exit 15"],
                "answer": 2,
                "explanationKo": "Maple Avenue를 우회 경로로 권합니다.",
            },
        ],
    },
    {
        "id": 5,
        "title": "Store promotional message",
        "voice": "UK-F1",
        "script": (
            "Shoppers, don't miss our weekend home essentials sale. All bedding and towels are 25 percent off through Sunday. "
            "Members of our loyalty program receive an extra 10 percent discount at checkout. "
            "Visit the third floor for live demos of our new vacuum models from 1 to 4 p.m. each day. "
            "Ask any associate for a free sample of our eco-friendly detergent."
        ),
        "questions": [
            {
                "q": "What products are on sale?",
                "choices": [
                    "Electronics only",
                    "Bedding and towels",
                    "Furniture sets",
                    "Kitchen appliances",
                ],
                "answer": 1,
                "explanationKo": "bedding and towels가 25% 할인입니다.",
            },
            {
                "q": "Where are the vacuum demos?",
                "choices": ["Basement", "First floor", "Second floor", "Third floor"],
                "answer": 3,
                "explanationKo": "third floor에서 시연이 있습니다.",
            },
            {
                "q": "What can shoppers get for free?",
                "choices": [
                    "A loyalty card",
                    "A vacuum bag",
                    "A detergent sample",
                    "Weekend parking",
                ],
                "answer": 2,
                "explanationKo": "친환경 detergent 무료 샘플을 받을 수 있다고 합니다.",
            },
        ],
    },
]


async def generate_all() -> dict:
    meta: dict = {"voices": VOICES, "part1": [], "part2": [], "part3": [], "part4": []}

    # Part 1
    for item in PART1:
        iid = item["id"]
        segs = []
        statements_meta = []
        for i, (text, vk) in enumerate(item["statements"]):
            spoken = letter_prefix(i) + text
            segs.append((spoken, vk))
            statements_meta.append({"text": text, "accent": ACCENT[vk], "voice": VOICES[vk]})
        out = AUDIO / "part1" / f"item{iid:02d}.mp3"
        print(f"Part1 item {iid} -> {out.name}")
        await save_concat(segs, out, gap_ms=700)
        meta["part1"].append(
            {
                "id": iid,
                "image": item["image"],
                "imageAlt": item["imageAlt"],
                "imageSeed": item["imageSeed"],
                "audio": f"audio/part1/item{iid:02d}.mp3",
                "statements": statements_meta,
                "answer": item["answer"],
                "explanationKo": item["explanationKo"],
                "accents": list({ACCENT[vk] for _, vk in item["statements"]}),
            }
        )

    # Part 2
    for item in PART2:
        iid = item["id"]
        q_text, q_vk = item["question"]
        segs = [(q_text, q_vk)]
        resp_meta = []
        for i, (text, vk) in enumerate(item["responses"]):
            segs.append((letter_prefix(i) + text, vk))
            resp_meta.append({"text": text, "accent": ACCENT[vk], "voice": VOICES[vk]})
        out = AUDIO / "part2" / f"item{iid:02d}.mp3"
        print(f"Part2 item {iid} -> {out.name}")
        await save_concat(segs, out, gap_ms=750)
        meta["part2"].append(
            {
                "id": iid,
                "audio": f"audio/part2/item{iid:02d}.mp3",
                "question": {"text": q_text, "accent": ACCENT[q_vk], "voice": VOICES[q_vk]},
                "responses": resp_meta,
                "answer": item["answer"],
                "explanationKo": item["explanationKo"],
                "accents": list({ACCENT[q_vk], *[ACCENT[vk] for _, vk in item["responses"]]}),
            }
        )

    # Part 3
    for item in PART3:
        iid = item["id"]
        segs = [(t, vk) for t, vk in item["speakers"]]
        out = AUDIO / "part3" / f"conv{iid:02d}.mp3"
        print(f"Part3 conv {iid} -> {out.name}")
        await save_concat(segs, out, gap_ms=450)
        transcript = "\n".join(t for t, _ in item["speakers"])
        accents = list({ACCENT[vk] for _, vk in item["speakers"]})
        meta["part3"].append(
            {
                "id": iid,
                "title": item["title"],
                "audio": f"audio/part3/conv{iid:02d}.mp3",
                "transcript": transcript,
                "speakers": [
                    {"text": t, "accent": ACCENT[vk], "voice": VOICES[vk]} for t, vk in item["speakers"]
                ],
                "questions": item["questions"],
                "accents": accents,
            }
        )

    # Part 4
    for item in PART4:
        iid = item["id"]
        vk = item["voice"]
        out = AUDIO / "part4" / f"talk{iid:02d}.mp3"
        print(f"Part4 talk {iid} -> {out.name}")
        await save(item["script"], vk, out)
        meta["part4"].append(
            {
                "id": iid,
                "title": item["title"],
                "audio": f"audio/part4/talk{iid:02d}.mp3",
                "transcript": item["script"],
                "accent": ACCENT[vk],
                "voice": VOICES[vk],
                "questions": item["questions"],
                "accents": [ACCENT[vk]],
            }
        )

    DATA_OUT.parent.mkdir(parents=True, exist_ok=True)
    DATA_OUT.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {DATA_OUT}")
    return meta


def download_images() -> None:
    import urllib.request

    IMAGES.mkdir(parents=True, exist_ok=True)
    for item in PART1:
        dest = ROOT / "public" / "images" / item["image"]
        if dest.exists() and dest.stat().st_size > 1000:
            print(f"Image exists: {dest.name}")
            continue
        # picsum with seed for stable image
        url = f"https://picsum.photos/seed/{item['imageSeed']}/640/480"
        print(f"Download {url} -> {dest}")
        req = urllib.request.Request(url, headers={"User-Agent": "toeic700-coach/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            dest.write_bytes(resp.read())


if __name__ == "__main__":
    download_images()
    asyncio.run(generate_all())
