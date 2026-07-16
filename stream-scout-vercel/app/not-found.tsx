import Link from "next/link";

export default function NotFound() {
  return <div className="status"><h1>Show not found</h1><Link className="button primaryButton" href="/">Return to Discover</Link></div>;
}
