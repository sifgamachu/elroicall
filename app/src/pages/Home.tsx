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
import SeasonalPromotion from "@/components/SeasonalPromotion";
import ChannelSpotlight from "@/components/ChannelSpotlight";
import "@/seasonal-promotion.css";
import { useSeason } from "@/lib/seasonal-context";

export default function Home() {
  const season = useSeason();
  return <div className={`elroi-site${season ? " elroi-season-autumn" : ""}`}><Nav /><main id="main-content"><WellEntry /><CallJourneys />{season && <SeasonalPromotion />}<DailyMoment /><CallFormats /><ChannelSpotlight /><DescentExperience /><StoryShelf /><ReturnRoomPreview /><Gift /><Faq /></main><Footer /></div>;
}
