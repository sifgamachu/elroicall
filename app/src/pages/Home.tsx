import DescentExperience from "@/components/DescentExperience";
import ReturnRoomPreview from "@/components/ReturnRoomPreview";
import StoryShelf from "@/components/StoryShelf";
import WellEntry from "@/components/WellEntry";
import DailyMoment from "@/components/DailyMoment";
import CallFormats from "@/components/CallFormats";
import CallJourneys from "@/components/CallJourneys";
import Nav from "@/sections/Nav";
import Gift from "@/sections/Gift";
import Faq from "@/sections/Faq";
import Footer from "@/sections/Footer";
import AutumnHome from "@/pages/AutumnHome";
import { AUTUMN_HOME_ENABLED } from "@/lib/autumn-readings";

export default function Home() {
  if (AUTUMN_HOME_ENABLED) return <AutumnHome />;
  return <div className="elroi-site"><Nav /><main id="main-content"><WellEntry /><CallJourneys /><DailyMoment /><CallFormats /><DescentExperience /><StoryShelf /><ReturnRoomPreview /><Gift /><Faq /></main><Footer /></div>;
}
