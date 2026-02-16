import type { LecturerProfile } from '../schemas';
import { lightenColor } from '../lib/colors';

export class SlideStyles {
  // Slide dimensions (inches) - 16:9 widescreen
  static readonly SLIDE_WIDTH = 13.333;
  static readonly SLIDE_HEIGHT = 7.5;

  // Margins
  static readonly MARGIN_LEFT = 1.0;
  static readonly MARGIN_TOP = 0.3;
  static readonly MARGIN_RIGHT = 1.0;
  static readonly MARGIN_BOTTOM = 0.5;

  // Content area
  static readonly CONTENT_WIDTH = 11.333;
  static readonly CONTENT_TOP = 1.6;
  static readonly CONTENT_HEIGHT = 5.4;

  // Title bar
  static readonly TITLE_TOP = 0.3;
  static readonly TITLE_HEIGHT = 1.0;
  static readonly TITLE_SEPARATOR_Y = 1.35;

  // Accent bar
  static readonly ACCENT_BAR_WIDTH = 0.08;
  static readonly ACCENT_BAR_HEIGHT = 1.0;
  static readonly ACCENT_BAR_LEFT = 1.0;
  static readonly ACCENT_BAR_TOP = 0.3;

  // Title text position (right of accent bar)
  static readonly TITLE_TEXT_LEFT = 1.3;
  static readonly TITLE_TEXT_WIDTH = 11.0;

  // Two-column layout
  static readonly TWO_COL_GAP = 0.4;
  static readonly TWO_COL_LEFT_WIDTH = 5.467;
  static readonly TWO_COL_RIGHT_LEFT = 6.867;
  static readonly TWO_COL_RIGHT_WIDTH = 5.467;

  // Image dimensions for content_with_image
  static readonly IMAGE_WIDTH = 5.0;
  static readonly IMAGE_HEIGHT = 4.5;
  static readonly IMAGE_LEFT = 7.333;
  static readonly TEXT_WITH_IMAGE_WIDTH = 5.833;

  // Diagram area
  static readonly DIAGRAM_AREA_LEFT = 1.0;
  static readonly DIAGRAM_AREA_TOP = 1.6;
  static readonly DIAGRAM_AREA_WIDTH = 11.333;
  static readonly DIAGRAM_AREA_HEIGHT = 5.0;

  // Slide number
  static readonly SLIDE_NUM_LEFT = 12.0;
  static readonly SLIDE_NUM_TOP = 7.0;
  static readonly SLIDE_NUM_WIDTH = 1.0;
  static readonly SLIDE_NUM_HEIGHT = 0.4;

  // Profile-based properties
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textDark: string;
  textLight: string;

  constructor(public profile: LecturerProfile) {
    this.primary = profile.colors.primary;
    this.secondary = profile.colors.secondary;
    this.accent = profile.colors.accent;
    this.background = profile.colors.background;
    this.textDark = profile.colors.text_dark;
    this.textLight = profile.colors.text_light;
  }

  bulletSize(level: number): number {
    return Math.max(this.profile.fonts.body_size_pt - level * 2, 12);
  }

  primaryLight(factor = 0.85): string {
    return lightenColor(this.primary, factor);
  }

  /** Convert inches to percentage of slide width */
  static xPercent(inches: number): string {
    return `${(inches / SlideStyles.SLIDE_WIDTH) * 100}%`;
  }

  /** Convert inches to percentage of slide height */
  static yPercent(inches: number): string {
    return `${(inches / SlideStyles.SLIDE_HEIGHT) * 100}%`;
  }

  /** Convert width in inches to percentage of slide width */
  static wPercent(inches: number): string {
    return `${(inches / SlideStyles.SLIDE_WIDTH) * 100}%`;
  }

  /** Convert height in inches to percentage of slide height */
  static hPercent(inches: number): string {
    return `${(inches / SlideStyles.SLIDE_HEIGHT) * 100}%`;
  }
}
