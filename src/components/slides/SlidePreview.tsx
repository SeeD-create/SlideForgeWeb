import type { SlideContent, LecturerProfile } from '../../schemas';
import { TitleSlide } from './layouts/TitleSlide';
import { SectionHeader } from './layouts/SectionHeader';
import { ContentSlide } from './layouts/ContentSlide';
import { ContentImageSlide } from './layouts/ContentImageSlide';
import { TwoColumnSlide } from './layouts/TwoColumnSlide';
import { TableSlide } from './layouts/TableSlide';
import { DiagramSlide } from './layouts/DiagramSlide';
import { KeyTakeawaySlide } from './layouts/KeyTakeawaySlide';

interface SlidePreviewProps {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
  imageData?: string;
  scale?: number;
}

const LAYOUT_MAP: Record<string, React.ComponentType<SlidePreviewProps>> = {
  title: TitleSlide,
  section_header: SectionHeader,
  content: ContentSlide,
  content_with_image: ContentImageSlide,
  two_column: TwoColumnSlide,
  table: TableSlide,
  diagram: DiagramSlide,
  key_takeaway: KeyTakeawaySlide,
};

export function SlidePreview(props: SlidePreviewProps) {
  const Component = LAYOUT_MAP[props.slide.layout_type] ?? ContentSlide;
  return <Component {...props} />;
}
