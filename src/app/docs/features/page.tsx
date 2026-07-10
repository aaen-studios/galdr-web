export default function Features() {
  return (
    <>
      <h1>Features</h1>
      <p>
        A complete reference to every spell in the galdr grimoire.
      </p>

      <h2>Convert</h2>
      <p>
        Single or batch conversion between any formats FFmpeg supports. Drag in
        files, choose your target, and cast. galdr handles video, audio, and
        image formats including MP4, MKV, WebM, AVI, MOV, GIF, MP3, FLAC, WAV,
        PNG, JPEG, and WebP.
      </p>
      <pre>{`galdr convert *.mp4 --to mkv
galdr convert input.mp4 --to gif  # Create GIFs from video`}</pre>

      <h2>Compress</h2>
      <p>
        Quality-controlled compression with live size estimation. Adjust the
        CRF value or target file size and see the result before you commit.
      </p>
      <pre>{`galdr compress input.mp4 --quality 60
galdr compress input.mp4 --max-size 50MB`}</pre>

      <h2>Inspect</h2>
      <p>
        Deep media inspection powered by ffprobe. View codec information,
        resolution, bitrate, frame rate, duration, and metadata — all within
        the terminal interface.
      </p>
      <pre>{`galdr inspect input.mkv
galdr inspect input.mp4 --json   # Machine-readable output`}</pre>

      <h2>Trim</h2>
      <p>
        Cut, crop, rotate, resize, speed up, and slow down your media. All the
        fundamental editing operations in one spell.
      </p>
      <pre>{`galdr trim input.mp4 --start 00:01:30 --end 00:02:15
galdr trim input.mp4 --crop 1920:1080:0:0
galdr trim input.mp4 --speed 2.0  # Double speed`}</pre>

      <h2>Rune Tags</h2>
      <p>
        Save your frequently-used settings as named runes. One click to apply
        your YouTube export preset, your Discord clip profile, or your archival
        quality settings.
      </p>
      <pre>{`galdr rune-save ᛏ youtube-h264
galdr rune-save ᚷ discord-clip
galdr rune-load ᛏ input.mp4`}</pre>

      <h2>Compare</h2>
      <p>
        Side-by-side before/after preview. See exactly what your settings do
        before committing to the full conversion.
      </p>
      <pre>{`galdr compare input.mp4 output.mp4
galdr compare input.mp4 --split    # Side-by-side view`}</pre>

      <h2>The Forge</h2>
      <p>
        A built-in non-linear video editor for quick cuts and compositions.
        Features a multi-track timeline with drag-and-drop support, trim/split
        tools, speed adjustment (0.25×–4×), and export to MP4, MKV, and more.
        Projects can be saved as <code>.galdr</code> files — a portable JSON
        format.
      </p>

      <h2>Subtitles</h2>
      <p>
        Auto-transcription powered by local <strong>Whisper</strong> models. No
        data leaves your machine. Generate subtitles, burn them into the video
        stream, mux as soft tracks, or extract existing ones. A live editor
        lets you preview subtitles against the video timeline.
      </p>

      <h2>Command Alchemy</h2>
      <p>
        The FFmpeg command builds in real time as you adjust settings. Every
        slider, dropdown, and toggle updates the command string immediately.
        Copy the final command for use in scripts or share it with others.
      </p>

      <h2>The Watch</h2>
      <p>
        A folder-watching daemon that monitors directories for new media files.
        When a file appears, galdr waits for the write to settle, then
        automatically converts it according to your preset rules. Runs in the
        system tray — set it and forget it.
      </p>
    </>
  );
}
