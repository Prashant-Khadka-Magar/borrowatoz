"use client"

import SearchBar from "./SearchBar";

export default function Navbar() {
  return <div>
    <nav className="flex justify-between">
      <span>LOGO</span>
      <SearchBar />
      <button>Login</button>
    </nav>
  </div>;
}
