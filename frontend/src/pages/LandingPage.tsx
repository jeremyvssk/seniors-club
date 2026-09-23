import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import ProfileCard from "../components/ProfileCard";
import { Avatar, Logo } from "../components/ui/design";
import { ViewableProfile } from "../types/User";
import henrikImg from "../assets/demo/henrik.jpg";
import maieImg from "../assets/demo/maie.jpg";
import peeterImg from "../assets/demo/peeter.jpg";
import { getToken } from "../lib/session";

const HENRIK: ViewableProfile = {
  name: "Henrik", age: "71", gender: "man", lookingFor: "love", lookingForGender: ["woman"], bio: "",
  hobbies: ["Board Games", "Walking", "Photography"], profilePicture: henrikImg, distanceKm: 3, isOnline: true,
};
const MAIE: ViewableProfile = {
  name: "Maie", age: "64", gender: "woman", lookingFor: "love", lookingForGender: ["man"], bio: "",
  hobbies: ["Dancing", "Music", "Cooking"], profilePicture: maieImg, distanceKm: 6,
};

const SeniorsClubLanding: React.FC = () => {
  const navigate = useNavigate();
  const loggedIn = Boolean(getToken());

  return (
    <div className="landing">
      <header className="l-nav">
        <Logo size={22} />
        {loggedIn ? (
          <button className="b-md btn" style={{ color: "var(--ink)" }} onClick={() => navigate("/explore")}>Open the app</button>
        ) : (
          <button className="b-md btn" style={{ color: "var(--ink)" }} onClick={() => navigate("/login")}>Log in</button>
        )}
      </header>
      <section className="l-hero">
        <div className="l-copy">
          <p className="eyebrow">Friendship · Love · Travel companions</p>
          <h1 className="l-h1">Meet people nearby who enjoy what you enjoy.</h1>
          <p className="l-p">
            Seniors' Club introduces you to people close to home who share your hobbies, whether you want company, a travel buddy or a little romance.
          </p>
          <div className="l-cta">
            <button className="b-lg pri btn" onClick={() => navigate("/signup")}>
              <span>Create an account</span>
              <ArrowRight className="i" />
            </button>
            <button className="b-lg sec btn l-login" onClick={() => navigate("/login")}>I already have one</button>
          </div>
          <div className="l-trust">
            <span><Check className="s" />Free to join</span>
          </div>
        </div>
        <div className="l-art" aria-hidden="true">
          <div className="l-c2"><ProfileCard profile={MAIE} className="still" /></div>
          <div className="l-c1"><ProfileCard profile={HENRIK} className="still" myHobbies={["Walking"]} /></div>
          <div className="float">
            <Avatar src={peeterImg} name="Peeter" size={48} />
            <div>
              <p style={{ fontWeight: 700 }}>Peeter accepted your request</p>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>You both enjoy Gardening and Walking</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeniorsClubLanding;
