import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // ✅ ঠিক জায়গায় সেভ হচ্ছে
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // ফাইলের নাম 그대로 রাখছে
  }
});

export const upload = multer({ storage });
