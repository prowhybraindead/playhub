import { Header } from "@/components/layout/header";
import { BooksExplorer } from "@/components/books/books-explorer";

export default function BooksPage() {
  return (
    <>
      <Header title="Sách Miễn Phí" subtitle="Tìm và đọc sách Project Gutenberg, xem detail và link đọc trực tiếp." />
      <BooksExplorer />
    </>
  );
}
