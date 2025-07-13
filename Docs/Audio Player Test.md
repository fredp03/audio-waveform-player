# Audio Waveform Player Test

This note demonstrates how to use the Audio Waveform Player plugin.

## Basic Audio Player

```audio-player
src: lick 1-guitar-120.wav
```

## Audio Player with Custom Width

```audio-player
src: lick 1-no-guitar-120.wav
width: 600
```

## Audio Player with Loop Enabled

```audio-player
src: lick 1-guitar-120.wav
loop: true
```

## Multiple Players

You can have multiple audio players in the same note:

### Guitar Version
```audio-player
src: lick 1-guitar-120.wav
```

### No Guitar Version  
```audio-player
src: lick 1-no-guitar-120.wav
```

## Tips

- Click anywhere on the waveform to seek to that position
- Use the loop button to repeat playback
- The waveform shows the actual audio data structure
- Players work independently of each other

## Supported File Formats

- WAV (.wav) ✓
- MP3 (.mp3) ✓  
- OGG (.ogg) ✓
- FLAC (.flac) ✓
- M4A (.m4a) ✓

## File Paths

Audio files should be:
- Located in your Obsidian vault
- Referenced with paths relative to vault root
- Example: `audio/my-song.mp3` or `recordings/lecture.wav`
