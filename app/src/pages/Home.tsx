import DescentExperience from "@/components/DescentExperience";
import ReturnRoomPreview from "@/components/ReturnRoomPreview";
import StoryShelf from "@/components/StoryShelf";
import WellEntry from "@/components/WellEntry";
import Nav from "@/sections/Nav";
import Gift from "@/sections/Gift";
import Faq from "@/sections/Faq";
import Footer from "@/sections/Footer";

export default function Home() {
  return <div className="elroi-site"><Nav /><main id="main-content"><WellEntry /><DescentExperience /><StoryShelf /><ReturnRoomPreview /><Gift /><Faq /></main><Footer /></div>;
}
