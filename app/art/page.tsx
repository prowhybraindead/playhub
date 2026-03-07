import { Header } from "@/components/layout/header";
import { ArtExplorer } from "@/components/art/art-explorer";

export default function ArtPage() {
  return (
    <>
      <Header title="Nghệ Thuật & Hình Ảnh" subtitle="Bộ sưu tập bảo tàng, bảng màu tự động và ảnh stock theo chủ đề." />
      <ArtExplorer />
    </>
  );
}
