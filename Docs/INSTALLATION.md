# Audio Waveform Player Plugin - Installation

## 📁 What's in this folder

This folder contains everything you need to install the Audio Waveform Player plugin:

**Essential Plugin Files:**
- `main.js` - The compiled plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styling
- `versions.json` - Version compatibility

**Documentation:**
- `README.md` - Complete plugin documentation
- `INSTALLATION.md` - This installation guide
- `Audio Player Test.md` - Test note with examples

**Sample Audio Files:**
- `lick 1-guitar-120.wav` - Sample guitar audio
- `lick 1-no-guitar-120.wav` - Sample backing track

## 🚀 Installation Steps

### Step 1: Copy Plugin to Obsidian

1. **Find your Obsidian plugins folder:**
   - Windows: `%APPDATA%\Obsidian\YourVaultName\.obsidian\plugins\`
   - Mac: `~/Library/Application Support/obsidian/YourVaultName/.obsidian/plugins/`
   - Linux: `~/.config/obsidian/YourVaultName/.obsidian/plugins/`

2. **Copy this entire folder:**
   - Drag the `audio-waveform-player` folder into the plugins directory
   - The final path should be: `.obsidian/plugins/audio-waveform-player/`

### Step 2: Enable the Plugin

1. **Open Obsidian Settings:**
   - Press `Ctrl/Cmd + ,` or go to File > Settings

2. **Navigate to Community Plugins:**
   - Settings > Community Plugins

3. **Enable the Plugin:**
   - Find "Audio Waveform Player" in the list
   - Toggle it ON

### Step 3: Test the Plugin

1. **Copy test files to your vault:**
   - Copy `Audio Player Test.md` to your vault root
   - Copy the `.wav` files to your vault (same location as the test note)

2. **Open the test note:**
   - Open `Audio Player Test.md` in Obsidian
   - You should see audio players with waveforms

## 🎵 Quick Start

Once installed, create audio players in any note using:

````markdown
```audio-player
src: path/to/your/audio.mp3
```
````

### Available Options:

````markdown
```audio-player
src: my-song.wav
width: 600
height: 200
loop: true
```
````

## Usage

Once installed, you can use the plugin by creating audio player blocks in your notes:

````markdown
```audio-player
src: path/to/your/audio.mp3
```
````

## 💡 Usage Tips

- **File Organization:** Keep audio files in an `audio/` folder in your vault
- **Supported Formats:** WAV, MP3, OGG, FLAC, M4A
- **Click to Seek:** Click anywhere on the waveform to jump to that position
- **Loop Mode:** Click the loop button for repeated playback
- **Multiple Players:** You can have many players in one note

## Commands

- **Insert Audio Player**: Use Command Palette (Ctrl/Cmd+P) to quickly insert a template

## 🔧 Troubleshooting

### Plugin Not Appearing
- Make sure you copied the folder to the correct location
- Restart Obsidian if needed
- Check that "Community Plugins" are enabled in Settings

### Audio Not Loading
- Verify the audio file exists in your vault
- Check the file path in the `src:` parameter
- Use forward slashes `/` in paths (even on Windows)
- Example: `src: audio/my-song.mp3` not `src: audio\my-song.mp3`

### Waveform Not Showing
- Large audio files may take a moment to process
- Check the browser console (Ctrl+Shift+I) for errors
- Ensure the audio format is supported

### Performance Issues
- Avoid having too many large audio files on one page
- Consider using compressed formats like MP3 for large files

## 🎯 Quick Command

After installation, use the Command Palette:
1. Press `Ctrl/Cmd + P`
2. Type "Insert Audio Player"
3. Select the command to insert a template

## 📱 Mobile Support

The plugin works on Obsidian mobile with some limitations:
- Basic playback controls work
- Waveform may be simplified on older devices
- Touch gestures supported for seeking

## 🆘 Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify file paths are correct and relative to vault root
3. Make sure audio files are in supported formats
4. Try the sample files first to confirm the plugin works
