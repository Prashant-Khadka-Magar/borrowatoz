"use client"

import SearchBar from "./SearchBar";

export default function Navbar() {
  return <div className="my-4 bg-gray-200 p-4">
    <nav className="flex justify-between">
      <span>LOGO</span>
      <SearchBar />
      <button>Login</button>
    </nav>
  </div>;
}
