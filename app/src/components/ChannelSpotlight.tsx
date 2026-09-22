import { ArrowRight, Play, Youtube } from 'lucide-react';
import { Link } from 'react-router';
import { CHANNEL_MESSAGES, messagePath, messageThumbnail, YOUTUBE_CHANNEL_URL } from '@/lib/youtube-channel';
import '@/watch.css';

export default function ChannelSpotlight() {
  const message = CHANNEL_MESSAGES[0];
  return <section className="elroi-channel-section elroi-container" aria-labelledby="channel-heading">
    <div className="elroi-channel-copy"><p className="watch-eyebrow"><Youtube size={19} /> FROM EL ROI CALLS ON YOUTUBE</p><h2 id="channel-heading">Let a message become<br />a conversation.</h2><p>Watch something that speaks to you. Sit with the Scripture. Bring what stays with you to El Roi.</p><div className="watch-actions"><Link className="elroi-button elroi-button-dark" to="/watch/">Watch & reflect <ArrowRight size={17} /></Link><a className="watch-text-link" href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Visit our channel <ArrowRight size={16} /></a></div><ol className="watch-steps" aria-label="Your path"><li><span>01</span> Watch</li><li><span>02</span> Reflect</li><li><span>03</span> Talk</li></ol></div>
    <Link to={messagePath(message)} className="watch-spotlight" aria-label={`Watch and reflect on ${message.title}`}><img src={messageThumbnail(message)} alt="" loading="lazy" width="480" height="360" /><span className="watch-play"><Play size={25} fill="currentColor" /></span><div className="watch-spotlight-caption"><span>FEATURED MESSAGE · {message.duration}</span><h3>{message.title}</h3><p>{message.passage}</p></div></Link>
  </section>;
}
