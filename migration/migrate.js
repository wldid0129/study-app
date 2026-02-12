const admin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");

admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json"))
});

const db = admin.firestore();

function formatDate(dateStr) {
  // "2026. 2. 4" → "2026-02-04"
  const parts = dateStr.split(".");
  const year = parts[0].trim();
  const month = parts[1].trim().padStart(2, "0");
  const day = parts[2].trim().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function migrate() {

  const rows = [];

  fs.createReadStream("코테 스터디 기록지_2월 - 설문지 응답 시트1.csv")
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {

      for (const row of rows) {

        const name = row["1. 이름을 선택해주세요. (본인 기록용 ※ 타인 이름 선택 시, 타인에게 기록됩니다.)"]?.trim();
        const rawDate = row["2. 오늘 날짜로 선택해주세요.(※ 오른쪽 하단 오늘 선택, 숫자 기입 안됩니다!! 캘릭더에서 선택!!!)"];
        const imageUrl = row["4. 인증 스크린샷을 첨부해주세요."];

        if (!name || !rawDate) continue;

        const date = formatDate(rawDate);

        // 이름으로 유저 찾기
        const userSnap = await db
          .collection("users")
          .where("name", "==", name)
          .get();

        if (userSnap.empty) {
          console.log("User not found:", name);
          continue;
        }

        const userId = userSnap.docs[0].id;

        // 중복 체크
        const exist = await db
          .collection("attendances")
          .where("userId", "==", userId)
          .where("date", "==", date)
          .get();

        if (!exist.empty) {
          console.log("Already exists:", name, date);
          continue;
        }

        await db.collection("attendances").add({
          userId,
          date,
          imageUrl: imageUrl || null,
          status: "approved",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("Inserted:", name, date);
      }

      console.log("Migration complete");
    });
}

migrate();
