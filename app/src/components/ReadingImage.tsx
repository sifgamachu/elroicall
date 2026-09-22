import { READING_SCENES, sceneSource, type ReadingArtwork } from '@/lib/reading-artwork';

export default function ReadingImage({ artwork, className, lazy = false }: { artwork: ReadingArtwork; className?: string; lazy?: boolean }) {
  return <img className={className} src={sceneSource(artwork.scene)}
    srcSet={`${sceneSource(artwork.scene, 'small')} 640w, ${sceneSource(artwork.scene)} 1280w`}
    sizes="(max-width: 700px) calc(100vw - 40px), 700px" width="1280" height="720"
    alt={READING_SCENES[artwork.scene]} loading={lazy ? 'lazy' : 'eager'} decoding="async" />;
}
