# Color Scheme - Band Song Manager App

## Light Theme Colors

| Token | Hex Color | Usage |
|-------|-----------|-------|
| Background | `#FFFFFF` | Main page background (white) |
| Foreground | `#0F0F10` | Primary text color (near black) |
| Primary | `#FB8500` | Primary action color (orange) |
| Primary Foreground | `#F9F9F8` | Text on primary buttons (off-white) |
| Secondary | `#F6F6F5` | Secondary backgrounds (light gray) |
| Secondary Foreground | `#261914` | Text on secondary elements (dark brown) |
| Muted | `#F6F6F5` | Muted backgrounds (light gray) |
| Muted Foreground | `#6E6965` | Muted text (medium gray) |
| Accent | `#F6F6F5` | Accent backgrounds (light gray) |
| Accent Foreground | `#261914` | Text on accent elements (dark brown) |
| Destructive | `#EF4444` | Error/danger actions (red) |
| Destructive Foreground | `#F9F9F8` | Text on destructive buttons (off-white) |
| Border | `#E8E5E3` | Border color (light beige) |
| Input | `#E8E5E3` | Input border color (light beige) |
| Ring | `#FB8500` | Focus ring color (orange) |
| Card | `#FFFFFF` | Card background (white) |
| Card Foreground | `#0F0F10` | Card text (near black) |
| Popover | `#FFFFFF` | Popover background (white) |
| Popover Foreground | `#0F0F10` | Popover text (near black) |

## Dark Theme Colors

| Token | Hex Color | Usage |
|-------|-----------|-------|
| Background | `#0F0F10` | Main page background (near black) |
| Foreground | `#F9F9F8` | Primary text color (off-white) |
| Primary | `#E8772F` | Primary action color (lighter orange) |
| Primary Foreground | `#F9F9F8` | Text on primary buttons (off-white) |
| Secondary | `#2E2926` | Secondary backgrounds (dark brown) |
| Secondary Foreground | `#F9F9F8` | Text on secondary elements (off-white) |
| Muted | `#2E2926` | Muted backgrounds (dark brown) |
| Muted Foreground | `#A69E94` | Muted text (light beige) |
| Accent | `#2E2926` | Accent backgrounds (dark brown) |
| Accent Foreground | `#F9F9F8` | Text on accent elements (off-white) |
| Destructive | `#C5481D` | Error/danger actions (dark red) |
| Destructive Foreground | `#F9F9F8` | Text on destructive buttons (off-white) |
| Border | `#2E2926` | Border color (dark brown) |
| Input | `#2E2926` | Input border color (dark brown) |
| Ring | `#E8772F` | Focus ring color (lighter orange) |
| Card | `#0F0F10` | Card background (near black) |
| Card Foreground | `#F9F9F8` | Card text (off-white) |
| Popover | `#0F0F10` | Popover background (near black) |
| Popover Foreground | `#F9F9F8` | Popover text (off-white) |

## Design Tokens

- **Border Radius**: `0.5rem` (8px)
- **Default Theme**: Light mode
- **Theme Toggle**: Supported (light/dark)

## Color Palette Summary

### Primary Colors
- **Orange (Light)**: `#FB8500`
- **Orange (Dark)**: `#E8772F`

### Neutral Colors
- **Light Grays**: `#F6F6F5`, `#E8E5E3`
- **Medium Gray**: `#6E6965`
- **Dark Grays**: `#2E2926`, `#0F0F10`

### Warm Neutrals
- **Off-white**: `#F9F9F8`
- **Dark Brown**: `#261914`
- **Light Beige**: `#A69E94`

### Error Colors
- **Red (Light)**: `#EF4444`
- **Red (Dark)**: `#C5481D`

## CSS Variables Format

```css
:root {
  --background: #FFFFFF;
  --foreground: #0F0F10;
  --primary: #FB8500;
  --primary-foreground: #F9F9F8;
  --secondary: #F6F6F5;
  --secondary-foreground: #261914;
  --muted: #F6F6F5;
  --muted-foreground: #6E6965;
  --accent: #F6F6F5;
  --accent-foreground: #261914;
  --destructive: #EF4444;
  --destructive-foreground: #F9F9F8;
  --border: #E8E5E3;
  --input: #E8E5E3;
  --ring: #FB8500;
  --card: #FFFFFF;
  --card-foreground: #0F0F10;
  --popover: #FFFFFF;
  --popover-foreground: #0F0F10;
  --radius: 0.5rem;
}

.dark {
  --background: #0F0F10;
  --foreground: #F9F9F8;
  --primary: #E8772F;
  --primary-foreground: #F9F9F8;
  --secondary: #2E2926;
  --secondary-foreground: #F9F9F8;
  --muted: #2E2926;
  --muted-foreground: #A69E94;
  --accent: #2E2926;
  --accent-foreground: #F9F9F8;
  --destructive: #C5481D;
  --destructive-foreground: #F9F9F8;
  --border: #2E2926;
  --input: #2E2926;
  --ring: #E8772F;
  --card: #0F0F10;
  --card-foreground: #F9F9F8;
  --popover: #0F0F10;
  --popover-foreground: #F9F9F8;
}
```


