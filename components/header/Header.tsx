// "use client";

import React from "react";
import Container from "../Container";
import MobileMenu from "./MobileMenu";
import HeaderMenu from "./HeaderMenu";
import Searchbar from "./Searchbar";
import CardIcon from "./CardIcon";
import FavoriteButton from "./FavoriteButton";
import Logo from "./Logo";
// import UserProfileDropdown from "./UserProfileDropdown";
import SignIn from "./SignIn";

function Header() {
  
  return (
    <header className="bg-white/70 py-4 sticky top-0 z-50 backdrop-blur-md">
      <Container className="flex items-center justify-between">
        {/* logo */}
        <div className="w-auto md:w-1/3 flex justify-start items-center  gap-2.5 md:gap-0">
          <MobileMenu />
          <Logo />
        </div>
        {/* NavLink */}
        <HeaderMenu />
        {/* NavButton */}
        <div className="w-auto md:w-1/3 flex justify-end items-center gap-3 md:gap-5">
          <Searchbar />
          <CardIcon />
          <FavoriteButton />
          <SignIn />
        </div>
      </Container>
    </header>
  );
}

export default Header;