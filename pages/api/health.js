export default function handler(req, res) {
  res.status(200).json({ status: "OK", message: "Socket.IO API is running" });
}
