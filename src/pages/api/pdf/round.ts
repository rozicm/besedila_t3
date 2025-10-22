import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import { db } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return res.status(400).send("Invalid id");
  const round = await db.round.findUnique({
    where: { id },
    include: { roundItems: { orderBy: { position: "asc" }, include: { song: true } } },
  });
  if (!round) return res.status(404).send("Not found");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="round-${id}.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);
  doc.fontSize(22).text(round.name, { underline: true });
  doc.moveDown();
  for (const ri of round.roundItems) {
    doc.addPage();
    doc.fontSize(18).text(ri.song.title);
    doc.moveDown();
    doc.fontSize(12).text(ri.song.lyrics, { align: "left" });
  }
  doc.end();
}


