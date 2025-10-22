import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import { db } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return res.status(400).send("Invalid id");
  const song = await db.song.findUnique({ where: { id } });
  if (!song) return res.status(404).send("Not found");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="song-${id}.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);
  doc.fontSize(20).text(song.title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(song.lyrics, { align: "left" });
  doc.end();
}


