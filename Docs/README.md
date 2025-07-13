# Audio Waveform Player Plugin for Obsidian

A powerful Obsidian plugin that provides real-time waveform visualization for audio files. Perfect for music practice, language learning, podcast analysis, and audio note-taking.

## Features

- **Real Waveform Visualization**: Displays actual audio waveform from your audio files
- **Smooth 60fps Playhead**: Buttery smooth playhead animation with visual progress tracking
- **Multiple Players Support**: Can have multiple audio players in the same note
- **Native Obsidian Integration**: Works seamlessly within Obsidian's interface
- **Vault File Support**: Directly plays audio files from your Obsidian vault
- **Click to Seek**: Click anywhere on the waveform to jump to that position
- **Loop Functionality**: Toggle loop mode for repeated playback
- **Responsive Design**: Adapts to your Obsidian theme (light/dark)

## Installation

### Manual Installation

1. Download the latest release files:
   - `main.js`
   - `manifest.json` 
   - `styles.css`

2. Create a new folder in your vault's `.obsidian/plugins/` directory called `audio-waveform-player`

3. Copy the downloaded files into this folder

4. Enable the plugin in Obsidian Settings > Community Plugins

### Building from Source

1. Clone this repository into your `.obsidian/plugins/` folder
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Enable the plugin in Obsidian Settings

## Usage

### Basic Audio Player Block

Use the audio player by creating a code block with the `audio-player` language:

````markdown
```audio-player
src: my-audio-file.mp3
```
````

### Configuration Options

You can customize the player with various options:

````markdown
```audio-player
src: guitar-lesson.wav
width: 600
height: 200
loop: true
```
````

Available options:
- `src`: Path to your audio file (relative to vault root)
- `width`: Player width in pixels (default: 500)
- `height`: Player height in pixels (default: 150)  
- `loop`: Enable loop mode by default (default: false)

### Multiple Players

You can have multiple audio players in the same note:

````markdown
## Guitar Lick 1
```audio-player
src: audio/lick-1-guitar.wav
```

## Guitar Lick 2  
```audio-player
src: audio/lick-2-guitar.wav
```
````

### Enhanced Audio Elements

The plugin also automatically enhances standard HTML audio elements in your notes:

```html
<audio src="my-song.mp3" controls></audio>
```

This will be automatically replaced with the enhanced waveform player.

### Keyboard Shortcuts

Once the plugin is installed, you can use the command palette to quickly insert audio players:

1. Press `Ctrl/Cmd + P` to open command palette
2. Type "Insert Audio Player" 
3. Select the command to insert a template

## Supported Audio Formats

- WAV (`.wav`)
- MP3 (`.mp3`) 
- OGG (`.ogg`)
- FLAC (`.flac`)
- M4A (`.m4a`)
- MP4 audio (`.mp4`)

### File Organization

Recommended folder structure in your Obsidian vault:

```
📁 Your Vault/
├── 📁 audio/
│   ├── guitar-licks/
│   │   ├── lick-1-guitar.wav
│   │   └── lick-2-guitar.wav
│   ├── language-lessons/
│   │   ├── french-lesson-1.mp3
│   │   └── spanish-lesson-1.mp3
│   └── podcast-clips/
│       └── interview-segment.mp3
└── 📄 Your Notes.md
```

## Advanced Usage

### Custom Styling

The plugin respects your Obsidian theme but you can add custom CSS in your vault's CSS snippets:

```css
/* Custom audio player styling */
.audio-player-wrapper {
  border-radius: 12px;
  background: var(--background-secondary);
}

.waveform-container {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
```

### Plugin Integration

This plugin works well with other Obsidian plugins:

- **Media Extended**: For video files with audio tracks
- **Advanced Tables**: For organizing audio file metadata
- **Templater**: For creating note templates with audio players
- **Dataview**: For querying notes containing audio files

## Troubleshooting

### Audio File Not Found
- Ensure the file path in `src:` is correct and relative to your vault root
- Check that the audio file exists in your vault
- Verify the file extension is supported

### Waveform Not Displaying  
- Large audio files may take a moment to process
- Check browser console for any error messages
- Ensure your browser supports the Web Audio API

### Performance Issues
- Consider using compressed audio formats (MP3, AAC) for large files
- The plugin caches waveform data for faster subsequent loads
- Multiple large audio files on one page may impact performance

## Browser Compatibility

- **Desktop**: Full support in Chrome, Firefox, Safari, Edge
- **Mobile**: Basic support (some features may be limited on older devices)
- **Obsidian Mobile**: Supported with latest Obsidian mobile app

## Development

### Building the Plugin

```bash
# Install dependencies
npm install

# Development build with watching
npm run dev

# Production build
npm run build
```

### Plugin Structure

- `main.ts` - Main plugin class and markdown processors
- `audio-player-component.ts` - Audio player component with waveform
- `styles.css` - Plugin styling that respects Obsidian themes
- `manifest.json` - Plugin metadata and configuration

## Privacy & Security

- All audio processing happens locally in your browser
- No data is sent to external servers
- Audio files remain private within your vault
- Web Audio API is used only for waveform generation

## Contributing

Contributions are welcome! Please feel free to:

- Report bugs or suggest features via GitHub issues
- Submit pull requests for improvements
- Share your use cases and workflows
- Help improve documentation
