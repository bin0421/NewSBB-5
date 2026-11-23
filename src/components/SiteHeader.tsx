import Link from "next/link";

export default function SiteHeader() {
  return (
    <header>
      <nav className="flex">
        <Link href="/" className="p-2 rounded hover:bg-gray-100">
          메인
        </Link>
        <Link href="/posts" className="p-2 rounded hover:bg-gray-100">
          글 목록
        </Link>
      </nav>
    </header>
  );
}
