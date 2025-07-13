const { Plugin, Component, TFile } = require('obsidian');

// Time stretching now relies on the browser's native playbackRate feature

class AudioWaveformPlayerComponent extends Component {
	constructor(container, config, app) {
		super();
		this.container = container;
		this.config = config;
		this.app = app;
		this.audioContext = null;
		this.audioBuffer = null;
		this.waveformData = null;
		this.isPlaying = false;
		this.isLooping = false;
		this.animationFrame = null;
		this.waveformBars = [];
		this.lastCurrentTime = 0;
		this.hasGuitar = true; // Track whether guitar version is currently playing
		this.guitarVersion = null; // Store guitar version path
		this.noGuitarVersion = null; // Store no-guitar version path
		this.primaryAudio = null; // Primary audio element
		this.secondaryAudio = null; // Secondary audio element for seamless switching
		this.currentAudio = null; // Currently active audio element
		this.isTransitioning = false; // Track if we're in the middle of a transition
		this.isSpeedSliderVisible = false; // Track speed slider visibility
		this.playbackSpeed = 100; // Current playback speed percentage (40-125%)
		this.isDraggingSpeedSlider = false; // Track if speed slider is being dragged
		
                // Simple time stretching using playbackRate
	}

	async render() {
        // Create the HTML structure
        this.container.innerHTML = `
            <div class="audio-player-wrapper" style="padding: 10px; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 25px; display: flex; width: ${this.config.width || 500}px; margin: 0 auto;">
                <div class="audio-player-frame" style="padding: 21px 24px 12px 24px; background: var(--background-primary); border: 1px solid var(--background-modifier-border); box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 11px; flex-direction: column; justify-content: flex-start; align-items: center; gap: 27px; display: flex; width: 100%;">
                    <div class="waveform-container" style="position: relative; cursor: pointer; width: 100%;">
                        <svg width="447" height="34" viewBox="0 0 447 34" fill="none" xmlns="http://www.w3.org/2000/svg" class="waveform-svg" style="width: 100%; height: 34px;">
                            <!-- Waveform will be generated here -->
                        </svg>
                        <div class="playhead" style="position: absolute; top: 0; left: 0; width: 2px; height: 34px; background: var(--text-accent); transition: left 0.1s ease-out; display: none;"></div>
                    </div>
                    <div class="controls" style="align-self: stretch; justify-content: space-between; align-items: center; display: inline-flex;">
                        <div class="volume-icon" style="cursor: pointer; transition: opacity 0.2s ease;">
							<svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8.25004 9.44682C8.25004 9.89572 7.74447 10.1571 7.38045 9.89637L4.53963 7.85937L8.25004 4.96316V9.44682ZM7.38045 0.103793C7.74447 -0.157125 8.25001 0.103885 8.25004 0.552806V3.56437L2.87565 7.75965H2.74996C2.14244 7.75965 1.64995 7.2654 1.64995 6.65572V3.34391C1.65002 2.73428 2.14248 2.23997 2.74996 2.23997H4.39998L7.38045 0.103793Z" fill="var(--text-muted)"/>
								<path d="M10.1122 0.700637C10.3519 0.513529 10.6975 0.556659 10.8841 0.797123C11.0705 1.03769 11.0275 1.38452 10.7879 1.57171L0.887776 9.29926C0.648064 9.48637 0.302464 9.44324 0.115939 9.20278C-0.0705037 8.96221 -0.0275275 8.61538 0.212083 8.42819L10.1122 0.700637Z" fill="var(--text-muted)"/>
							</svg>
						</div>
                        <div class="guitar-icon" style="cursor: pointer; transition: opacity 0.2s ease;">
							<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M14.7847 0.49309C14.5675 0.779052 14.1588 1.21574 13.8764 1.4636C13.4064 1.87609 13.3586 1.95132 13.3115 2.35413C13.2642 2.75932 13.012 3.15042 10.12 7.30558C8.39296 9.78694 6.93503 11.8649 6.88014 11.9232C6.7396 12.0729 6.10327 11.7734 5.90262 11.4632C5.76035 11.2433 5.75905 11.1909 5.88378 10.7192C5.97029 10.3923 5.98983 10.1608 5.93884 10.0686C5.80994 9.83516 5.38798 9.89455 5.0521 10.1933C4.73072 10.4791 4.30546 11.2495 4.30407 11.5484C4.30268 11.8526 3.9079 12.6092 3.64325 12.815C3.50557 12.922 3.03349 13.2473 2.59416 13.5376C2.15491 13.828 1.65183 14.2328 1.47637 14.4371C0.823191 15.1975 0.588585 16.0722 0.862451 16.7253C1.26252 17.679 2.62717 18.9626 3.95151 19.6306C4.63127 19.9735 4.73454 20 5.39094 20C6.00607 20 6.16407 19.9657 6.60514 19.736C6.96404 19.5491 7.19526 19.3496 7.39669 19.0528C7.68098 18.6338 7.73509 18.4395 8.08817 16.5685C8.31157 15.3847 8.38141 15.2558 8.96736 14.9474C9.7484 14.5363 10.1101 14.1409 10.2814 13.5109C10.4966 12.7192 10.0529 12.2188 9.12562 12.2071C8.16192 12.1952 8.11388 12.3485 9.93792 9.61527C14.0543 3.44686 13.9824 3.54848 14.257 3.51874C14.3967 3.50361 14.556 3.43199 14.6111 3.35948C14.6766 3.27334 14.7311 3.25997 14.7682 3.32095C14.8637 3.47739 14.9886 3.42512 14.9886 3.22882C14.9886 3.10018 14.9487 3.05892 14.8583 3.09411C14.7705 3.12816 14.728 3.08989 14.728 2.97673C14.728 2.77991 14.8652 2.66719 14.9452 2.79829C15.0183 2.91822 15.1623 2.82337 15.1623 2.65523C15.1623 2.56442 15.1097 2.53943 14.9958 2.57604C14.8615 2.61915 14.8382 2.59531 14.8749 2.45268C14.9043 2.339 14.9836 2.28268 15.097 2.29509C15.194 2.30565 15.2908 2.26491 15.312 2.20437C15.3348 2.13909 15.277 2.09439 15.1695 2.09439C14.9707 2.09439 14.9479 2.03042 15.0755 1.83042C15.1316 1.74244 15.1601 1.73513 15.161 1.80843C15.1617 1.86896 15.221 1.91841 15.2926 1.91841C15.3672 1.91841 15.4229 1.83913 15.4229 1.73302C15.4229 1.60438 15.383 1.56312 15.2926 1.59831C15.204 1.63271 15.1623 1.59356 15.1623 1.47574C15.1623 1.28736 15.29 1.24389 15.3852 1.3999C15.4266 1.46774 15.4672 1.46114 15.5193 1.3779C15.6371 1.18961 15.6106 1.12652 15.4136 1.12652C15.2825 1.12652 15.2455 1.0871 15.2833 0.98732C15.3123 0.910771 15.336 0.826742 15.336 0.80061C15.336 0.774389 15.3963 0.803689 15.47 0.865633C15.5652 0.945702 15.6309 0.950981 15.6969 0.88411C15.8192 0.760223 15.713 0.592605 15.552 0.655253C15.4537 0.69344 15.4305 0.630616 15.4462 0.368851C15.4781 -0.16207 15.2499 -0.119132 14.7847 0.49309ZM7.00626 12.944C7.65952 13.4186 7.75924 13.5753 7.50952 13.7348C7.40094 13.8041 7.22306 13.7198 6.70607 13.3542C6.03456 12.8793 5.95787 12.7735 6.14635 12.5826C6.29679 12.4302 6.30183 12.4322 7.00626 12.944ZM4.03524 13.6537C4.1518 13.7959 4.07389 14.0608 3.91537 14.0608C3.85475 14.0608 3.75642 14.0014 3.69692 13.9288C3.61067 13.8235 3.61067 13.7702 3.69692 13.6648C3.83095 13.5013 3.90825 13.4987 4.03524 13.6537ZM5.74254 14.8747C6.09615 15.1287 6.38634 15.371 6.38747 15.4131C6.3893 15.4799 5.52235 16.7948 5.34464 16.9948C5.28679 17.0599 3.93787 16.1779 3.83347 16.0067C3.77041 15.9034 4.83877 14.4127 4.97584 14.4127C5.04393 14.4127 5.38894 14.6207 5.74254 14.8747ZM3.30606 14.8087C3.30606 15.012 3.01334 15.1016 2.90885 14.9303C2.81843 14.782 2.98659 14.5728 3.16778 14.6082C3.24387 14.6229 3.30606 14.7132 3.30606 14.8087ZM2.50426 15.4906C2.56593 15.6695 2.47377 15.8206 2.30301 15.8206C2.11148 15.8206 2.01333 15.6834 2.07961 15.5084C2.13885 15.352 2.45206 15.3389 2.50426 15.4906Z" fill="var(--text-muted)"/>
							</svg>
						</div>
						<div class="play-pause" style="padding-left: 32px; padding-right: 32px; justify-content: flex-start; align-items: center; gap: 71px; display: flex;">
							<div class="play-btn" style="cursor: pointer;">
								<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M18.9091 13.1064C19.697 12.5954 19.697 11.4046 18.9091 10.8936L2.42348 0.200406C1.58614 -0.342724 0.5 0.282035 0.5 1.30681V22.6932C0.5 23.718 1.58614 24.3427 2.42348 23.7996L18.9091 13.1064Z" fill="var(--text-muted)"/>
								</svg>
							</div>
							<div class="pause-btn" style="cursor: pointer; display: none;">
								<svg width="20" height="24" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M0 1.33333C0 0.596954 0.615609 0 1.375 0H2.75C3.50939 0 4.125 0.596954 4.125 1.33333V10.6667C4.125 11.403 3.50939 12 2.75 12H1.375C0.615608 12 0 11.403 0 10.6667V1.33333Z" fill="var(--text-muted)"/>
									<path d="M6.875 1.33333C6.875 0.596954 7.49061 0 8.25 0H9.625C10.3844 0 11 0.596954 11 1.33333V10.6667C11 11.403 10.3844 12 9.625 12H8.25C7.49061 12 6.875 11.403 6.875 10.6667V1.33333Z" fill="var(--text-muted)"/>
								</svg>
							</div>
						</div>
						<div class="loop-btn" style="cursor: pointer; opacity: 0.6;">
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M2.34374 6.60969C2.34374 4.75107 3.8129 3.24437 5.62519 3.24437H8.35973M10.5474 7.17057C10.5474 9.02919 9.07821 10.5359 7.26592 10.5359H4.53138M8.35973 5.14669V1.56178C8.35973 1.12124 8.83223 0.852667 9.1965 1.08615L11.993 2.87861C12.3357 3.09829 12.3357 3.61019 11.993 3.82987L9.1965 5.62232C8.83223 5.85581 8.35973 5.58723 8.35973 5.14669ZM5.14027 12.4382V8.85331C5.14027 8.41277 4.66777 8.14419 4.3035 8.37768L1.50705 10.1701C1.16432 10.3898 1.16432 10.9017 1.50705 11.1214L4.3035 12.9138C4.66777 13.1473 5.14027 12.8788 5.14027 12.4382Z" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<div class="speed-icon" style="cursor: pointer; opacity: 0.6;">
							<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M5.23529 8.6C5.23529 8.33736 5.28094 8.07728 5.36962 7.83463C5.45831 7.59198 5.5883 7.3715 5.75216 7.18579C5.91603 7.00007 6.11057 6.85275 6.32468 6.75224C6.53878 6.65173 6.76826 6.6 7 6.6C7.23175 6.6 7.46122 6.65173 7.67532 6.75224C7.88943 6.85275 8.08397 7.00007 8.24784 7.18579C8.4117 7.3715 8.54169 7.59198 8.63038 7.83463C8.71906 8.07729 8.76471 8.33736 8.76471 8.6M8.05882 6.6L9.47059 4.2M1 7.8C1 6.90701 1.15519 6.02277 1.45672 5.19775C1.75825 4.37274 2.20021 3.62311 2.75736 2.99167C3.31451 2.36023 3.97595 1.85935 4.7039 1.51762C5.43186 1.17589 6.21207 1 7 1C7.78793 1 8.56815 1.17589 9.2961 1.51762C10.0241 1.85935 10.6855 2.36024 11.2426 2.99168C11.7998 3.62312 12.2418 4.37274 12.5433 5.19776C12.8448 6.02277 13 6.90702 13 7.8V8.2C13 8.64183 12.684 9 12.2941 9H1.70588C1.31603 9 1 8.64183 1 8.2L1 7.8Z" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
				</div>
				<div class="playback-speed-wrapper" style="align-self: stretch; height: 47px; flex-direction: column; justify-content: space-between; align-items: center; display: none;">
					<div class="playback-speed-menu" style="padding: 15px; background: var(--background-primary); box-shadow: 0px 4px 3.4px rgba(0, 0, 0, 0.25); border-radius: 4px; justify-content: flex-start; align-items: center; gap: 10px; display: inline-flex; position: relative;">

						<div class="playback-speed-slider-container" style="position: relative; width: 211px; height: 13px; display: flex; align-items: center;">
							<!-- Rail line -->
							<div class="slider-rail" style="position: absolute; left: 1.5px; right: 1.5px; height: 3px; background: var(--text-muted); border-radius: 1.5px;"></div>
							
							<!-- Grabber circle -->
							<div class="playback-speed-slider-grabber" style="position: absolute; left: 126px; width: 14px; height: 14px; transform: translateX(-50%); cursor: grab;">
								<div style="width: 13px; height: 13px; background: #6586B3; border-radius: 50%; border: 0.5px solid #5a75a0;"></div>
							</div>
						</div>

						<div class="playback-speed-indicator" style="color: var(--text-muted); font-size: 10px; font-family: var(--font-interface); font-weight: 400;">100%</div>
					</div>
				</div>

			</div>
			<audio preload="auto" style="display: none;" class="primary-audio"></audio>
			<audio preload="auto" style="display: none;" class="secondary-audio"></audio>
		`;

		// Get references to elements
		this.primaryAudio = this.container.querySelector('.primary-audio');
		this.secondaryAudio = this.container.querySelector('.secondary-audio');
		this.currentAudio = this.primaryAudio; // Start with primary
		this.audio = this.currentAudio; // For backward compatibility
		this.waveformSvg = this.container.querySelector('.waveform-svg');
		this.waveformContainer = this.container.querySelector('.waveform-container');
		this.playhead = this.container.querySelector('.playhead');
		this.playBtn = this.container.querySelector('.play-btn');
		this.pauseBtn = this.container.querySelector('.pause-btn');
		this.loopBtn = this.container.querySelector('.loop-btn');
		this.guitarIcon = this.container.querySelector('.guitar-icon');
		this.speedIcon = this.container.querySelector('.speed-icon');
		this.speedSliderWrapper = this.container.querySelector('.playback-speed-wrapper');
		this.speedSliderGrabber = this.container.querySelector('.playback-speed-slider-grabber');
		this.speedSliderContainer = this.container.querySelector('.playback-speed-slider-container');
		this.speedIndicator = this.container.querySelector('.playback-speed-indicator');

		// Set up the audio source
		await this.setupAudio();
		this.setupEventListeners();
		await this.loadAudioData();
		this.generateWaveform();
		
		// Initialize speed slider position for 100%
		this.updateSpeedSliderPosition();
	}

	async setupAudio() {
		let audioPath = this.config.src;
		
		// If it's just a filename (no path separators), prepend the standard path
		if (!audioPath.includes('/') && !audioPath.includes('\\')) {
			audioPath = `Assets/Audio Files/${audioPath}`;
		}
		
		// Detect guitar and no-guitar versions
		this.detectAudioVersions(audioPath);
		
		try {
			// Set up primary audio with the initial file
			await this.loadAudioToElement(this.primaryAudio, audioPath);
			
			// Preload the alternate version in the secondary audio element
			const alternateAudioPath = this.hasGuitar ? this.noGuitarVersion : this.guitarVersion;
			await this.loadAudioToElement(this.secondaryAudio, alternateAudioPath);
			
		} catch (error) {
			console.warn('Could not load audio files:', error);
		}
	}

	async loadAudioToElement(audioElement, audioPath) {
		try {
			// Try to find the file in the vault
			const file = this.app.vault.getAbstractFileByPath(audioPath);
			if (file && file instanceof TFile) {
				// Get the file URL for local files
				const arrayBuffer = await this.app.vault.readBinary(file);
				const blob = new Blob([arrayBuffer]);
				const url = URL.createObjectURL(blob);
				audioElement.src = url;
			} else {
				// Fallback: assume it's a relative path from the vault root
				audioElement.src = audioPath;
			}
			
			// Ensure the audio is fully preloaded
			audioElement.preload = 'auto';
			
			// Wait for the audio to be ready
			return new Promise((resolve) => {
				const onCanPlayThrough = () => {
					audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
					resolve();
				};
				
				if (audioElement.readyState >= 4) {
					// Already loaded
					resolve();
				} else {
					audioElement.addEventListener('canplaythrough', onCanPlayThrough);
					audioElement.load(); // Force load
				}
			});
			
		} catch (error) {
			console.warn('Could not load audio file from vault, trying direct path:', error);
			audioElement.src = audioPath;
		}
	}

	detectAudioVersions(audioPath) {
		// Check if the path contains "guitar" or "no-guitar" and create both versions
		if (audioPath.includes('-guitar.') || audioPath.includes('-guitar-')) {
			// This is a guitar version
			this.guitarVersion = audioPath;
			this.noGuitarVersion = audioPath.replace('-guitar', '-no-guitar');
			this.hasGuitar = true;
		} else if (audioPath.includes('-no-guitar.') || audioPath.includes('-no-guitar-')) {
			// This is a no-guitar version
			this.guitarVersion = audioPath.replace('-no-guitar', '-guitar');
			this.noGuitarVersion = audioPath;
			this.hasGuitar = false;
		} else {
			// If no guitar/no-guitar pattern is found, assume current file is guitar version
			// and try to generate the no-guitar version
			const pathParts = audioPath.split('.');
			const extension = pathParts.pop();
			const basePath = pathParts.join('.');
			
			this.guitarVersion = audioPath;
			this.noGuitarVersion = `${basePath}-no-guitar.${extension}`;
			this.hasGuitar = true;
		}
		
		// Update guitar icon state
		this.updateGuitarIconState();
		
		// Initialize speed icon state
		this.updateSpeedIconState();
	}

	setupEventListeners() {
		this.playBtn.addEventListener('click', () => this.play());
		this.pauseBtn.addEventListener('click', () => this.pause());
		this.loopBtn.addEventListener('click', () => this.toggleLoop());
		this.guitarIcon.addEventListener('click', () => this.toggleGuitar());
		this.speedIcon.addEventListener('click', () => this.toggleSpeedSlider());
		
		this.waveformContainer.addEventListener('click', (e) => {
			// Don't seek if we're dragging the playhead
			if (!this.isDragging) {
				this.seekToPosition(e);
			}
		});
		
		// Add hover and keyboard support for spacebar play/pause
		let isHovering = false;
		
		this.container.addEventListener('mouseenter', () => {
			isHovering = true;
		});
		
		this.container.addEventListener('mouseleave', () => {
			isHovering = false;
		});
		
		// Add keyboard listener to document for spacebar
		this.keyboardHandler = (e) => {
			if (isHovering && e.code === 'Space') {
				e.preventDefault();
				if (this.isPlaying) {
					this.pause();
				} else {
					this.play();
				}
			}
			
			// Speed slider keyboard controls (only when speed slider is visible)
			if (isHovering && this.isSpeedSliderVisible) {
				if (e.code === 'ArrowLeft') {
					e.preventDefault();
					this.adjustSpeedByIncrement(-10);
				} else if (e.code === 'ArrowRight') {
					e.preventDefault();
					this.adjustSpeedByIncrement(10);
				}
			}
		};
		
		document.addEventListener('keydown', this.keyboardHandler);
		
		// Add playhead dragging functionality
		this.isDragging = false;
		
		this.playhead.addEventListener('mousedown', (e) => {
			if (!this.isPlaying) {
				this.isDragging = true;
				this.playhead.style.cursor = 'grabbing';
				e.preventDefault();
			}
		});
		
		this.mouseMoveHandler = (e) => {
			if (this.isDragging && !this.isPlaying) {
				const rect = this.waveformContainer.getBoundingClientRect();
				const mouseX = e.clientX - rect.left;
				const progress = Math.max(0, Math.min(1, mouseX / rect.width));
				
				// Update playhead position
				const playheadPosition = progress * rect.width;
				this.playhead.style.left = `${playheadPosition}px`;
				
				// Update audio position
				if (this.currentAudio.duration) {
					const newTime = progress * this.currentAudio.duration;
					this.currentAudio.currentTime = newTime;
					
					// Sync both audio elements
					const otherAudio = this.currentAudio === this.primaryAudio ? this.secondaryAudio : this.primaryAudio;
					if (otherAudio.duration) {
						otherAudio.currentTime = newTime;
					}
				}
				
				// Update waveform opacity
				this.updateWaveformOpacity(playheadPosition);
			}
		};
		
		this.mouseUpHandler = () => {
			if (this.isDragging) {
				this.isDragging = false;
				this.playhead.style.cursor = '';
			}
		};
		
		document.addEventListener('mousemove', this.mouseMoveHandler);
		document.addEventListener('mouseup', this.mouseUpHandler);
		
		// Add hover effect for playhead when paused
		this.playhead.addEventListener('mouseenter', () => {
			if (!this.isPlaying) {
				this.playhead.style.cursor = 'grab';
			}
		});
		
		this.playhead.addEventListener('mouseleave', () => {
			if (!this.isDragging) {
				this.playhead.style.cursor = '';
			}
		});
		
		// Speed slider dragging functionality
		this.speedSliderGrabber.addEventListener('mousedown', (e) => {
			this.isDraggingSpeedSlider = true;
			this.speedSliderGrabber.style.cursor = 'grabbing';
			e.preventDefault();
		});
		
		// Speed slider double-click to reset to 100%
		this.speedSliderGrabber.addEventListener('dblclick', (e) => {
			this.playbackSpeed = 100;
			this.updateSpeedSliderPosition();
			this.updateSpeedIndicator();
			
			// Apply time stretching
			this.updateTimeStretching();
			
			e.preventDefault();
		});
		
		this.speedSliderMouseMoveHandler = (e) => {
			if (this.isDraggingSpeedSlider) {
				const rect = this.speedSliderContainer.getBoundingClientRect();
				const mouseX = e.clientX - rect.left;
				const progress = Math.max(0, Math.min(1, mouseX / rect.width));
				
				// Convert progress to speed percentage (40% to 125%)
				this.playbackSpeed = Math.round(40 + (progress * 85)); // 85 = 125 - 40
				
				// Update slider position and indicator
				this.updateSpeedSliderPosition();
				this.updateSpeedIndicator();
				
				console.log(`Speed slider moved to: ${this.playbackSpeed}%`);
			}
		};
		
		this.speedSliderMouseUpHandler = () => {
			if (this.isDraggingSpeedSlider) {
				this.isDraggingSpeedSlider = false;
				this.speedSliderGrabber.style.cursor = 'grab';
				
				// Apply time stretching (after drag is complete)
				this.updateTimeStretching();
			}
		};
		
		document.addEventListener('mousemove', this.speedSliderMouseMoveHandler);
		document.addEventListener('mouseup', this.speedSliderMouseUpHandler);
		
		// Add hover effect for speed slider grabber
		this.speedSliderGrabber.addEventListener('mouseenter', () => {
			if (!this.isDraggingSpeedSlider) {
				this.speedSliderGrabber.style.cursor = 'grab';
			}
		});
		
		this.speedSliderGrabber.addEventListener('mouseleave', () => {
			if (!this.isDraggingSpeedSlider) {
				this.speedSliderGrabber.style.cursor = 'grab';
			}
		});
		
		// Set up event listeners for both audio elements
		[this.primaryAudio, this.secondaryAudio].forEach(audio => {
			audio.addEventListener('ended', () => {
				if (audio === this.currentAudio) {
					if (this.isLooping) {
						audio.currentTime = 0;
						this.resetWaveformOpacity();
						audio.play();
					} else {
						this.stop();
					}
				}
			});

			audio.addEventListener('timeupdate', () => {
				if (audio === this.currentAudio) {
					if (this.isLooping && audio.currentTime < 0.1 && this.lastCurrentTime > audio.duration - 0.1) {
						this.resetWaveformOpacity();
					}
					this.lastCurrentTime = audio.currentTime;
				}
			});
		});
	}

	async loadAudioData() {
		try {
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        await this.loadAudioForWaveform();
		} catch (error) {
			console.error('Error loading audio for waveform:', error);
		}
	}

        async loadAudioForWaveform() {
		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', this.currentAudio.src, true);
			xhr.responseType = 'arraybuffer';
			
			xhr.onload = async () => {
				if (xhr.status === 200 || xhr.status === 0) {
					try {
						if (this.audioContext) {
							this.audioBuffer = await this.audioContext.decodeAudioData(xhr.response);
							this.waveformData = this.audioBuffer.getChannelData(0);
						}
						resolve();
					} catch (e) {
						console.warn('Could not decode audio data for waveform');
						resolve();
					}
				} else {
					resolve();
				}
			};
			
			xhr.onerror = () => resolve();
			xhr.send();
		});
	}

	generateWaveform() {
		if (!this.waveformData) {
			return;
		}

		const svgWidth = 447;
		const svgHeight = 34;
		const samples = 200;
		const barWidth = 2.235;

		this.waveformSvg.innerHTML = '';
		this.waveformBars = [];

		const samplesPerBar = Math.floor(this.waveformData.length / samples);

		for (let i = 0; i < samples; i++) {
			let sum = 0;
			let count = 0;

			for (let j = 0; j < samplesPerBar; j++) {
				const index = i * samplesPerBar + j;
				if (index < this.waveformData.length) {
					sum += Math.abs(this.waveformData[index]);
					count++;
				}
			}

			const average = count > 0 ? sum / count : 0;
			const barHeight = Math.max(1, average * svgHeight * 2);
			const x = i * barWidth;
			const y = (svgHeight - barHeight) / 2;

			const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute('x', x.toString());
			rect.setAttribute('y', y.toString());
			rect.setAttribute('width', (barWidth - 0.5).toString());
			rect.setAttribute('height', barHeight.toString());
			rect.setAttribute('fill', 'var(--text-muted)');
			rect.setAttribute('fill-opacity', '0.6');

			this.waveformSvg.appendChild(rect);
			this.waveformBars.push(rect);
		}
	}

	play() {
		this.currentAudio.play();
		this.isPlaying = true;
		this.playBtn.style.display = 'none';
		this.pauseBtn.style.display = 'block';
		this.playhead.style.display = 'block';
		this.updatePlayhead();
	}

	pause() {
		this.currentAudio.pause();
		this.isPlaying = false;
		this.playBtn.style.display = 'block';
		this.pauseBtn.style.display = 'none';
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
	}

	stop() {
		this.currentAudio.pause();
		this.currentAudio.currentTime = 0;
		this.isPlaying = false;
		this.playBtn.style.display = 'block';
		this.pauseBtn.style.display = 'none';
		this.playhead.style.display = 'none';
		this.resetWaveformOpacity();
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
		}
	}

	updatePlayhead() {
		if (!this.isPlaying) return;

		if (this.currentAudio.duration) {
			const progress = this.currentAudio.currentTime / this.currentAudio.duration;
			const waveformWidth = this.waveformContainer.offsetWidth;
			const playheadPosition = progress * waveformWidth;
			
			this.playhead.style.left = `${playheadPosition}px`;
			this.updateWaveformOpacity(playheadPosition);
		}

		this.animationFrame = requestAnimationFrame(() => this.updatePlayhead());
	}

        updateWaveformOpacity(playheadPosition) {
                const waveformWidth = this.waveformContainer.offsetWidth;
                const barWidth = waveformWidth / this.waveformBars.length;
                const currentBarIndex = Math.floor(playheadPosition / barWidth);

		this.waveformBars.forEach((bar, index) => {
			if (index <= currentBarIndex) {
				bar.setAttribute('fill-opacity', '1');
			} else {
				bar.setAttribute('fill-opacity', '0.6');
			}
		});
	}

	resetWaveformOpacity() {
		this.waveformBars.forEach(bar => {
			bar.setAttribute('fill-opacity', '0.6');
		});
	}

	seekToPosition(event) {
		if (!this.currentAudio.duration) return;

		const rect = this.waveformContainer.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const progress = clickX / rect.width;
		const newTime = progress * this.currentAudio.duration;

		const targetTime = Math.max(0, Math.min(newTime, this.currentAudio.duration));
		
		// Sync both audio elements to maintain perfect alignment
		this.currentAudio.currentTime = targetTime;
		const otherAudio = this.currentAudio === this.primaryAudio ? this.secondaryAudio : this.primaryAudio;
		if (otherAudio.duration) {
			otherAudio.currentTime = targetTime;
		}
		
		// Update playhead position regardless of playing state
		const waveformWidth = this.waveformContainer.offsetWidth;
		const playheadPosition = progress * waveformWidth;
		this.playhead.style.left = `${playheadPosition}px`;
		this.updateWaveformOpacity(playheadPosition);
		
		// If currently playing, updatePlayhead will continue to run
		// If paused, we've manually updated the position above
		if (this.isPlaying) {
			this.updatePlayhead();
		}
	}

	toggleLoop() {
		this.isLooping = !this.isLooping;
		this.primaryAudio.loop = this.isLooping;
		this.secondaryAudio.loop = this.isLooping;

		if (this.isLooping) {
			this.loopBtn.style.opacity = '1';
			this.loopBtn.style.transform = 'scale(1.1)';
		} else {
			this.loopBtn.style.opacity = '0.6';
			this.loopBtn.style.transform = 'scale(1)';
		}
	}

	async toggleGuitar() {
		if (this.isTransitioning) return; // Prevent multiple simultaneous transitions
		
		this.isTransitioning = true;
		const wasPlaying = this.isPlaying;
		const currentTime = this.currentAudio.currentTime;
		
		// Toggle the guitar state
		this.hasGuitar = !this.hasGuitar;
		
		// Determine which audio element to switch to
		const nextAudio = this.currentAudio === this.primaryAudio ? this.secondaryAudio : this.primaryAudio;
		
		try {
			if (wasPlaying) {
				// For seamless transition, we need to prep the next audio first
				nextAudio.currentTime = currentTime;
				
				// Wait a tiny bit to ensure seeking is complete
				await new Promise(resolve => setTimeout(resolve, 10));
				
				// Start the next audio silently
				nextAudio.volume = 0;
				await nextAudio.play();
				
				// Now do a very quick crossfade
				this.seamlessCrossFade(this.currentAudio, nextAudio);
				
			} else {
				// If not playing, just sync the position
				nextAudio.currentTime = currentTime;
			}
			
			// Switch the current audio reference immediately after starting crossfade
			this.currentAudio = nextAudio;
			this.audio = this.currentAudio; // Update for backward compatibility
			
			// Don't regenerate waveform during playback to avoid interruption
			if (!wasPlaying) {
				await this.loadAudioData();
				this.generateWaveform();
			}
			
		} catch (error) {
			console.warn('Could not switch audio:', error);
			// Revert the toggle if switching failed
			this.hasGuitar = !this.hasGuitar;
		}
		
		this.isTransitioning = false;
		// Update the guitar icon state
		this.updateGuitarIconState();
	}

	seamlessCrossFade(fadeOutAudio, fadeInAudio) {
		// Very fast crossfade to minimize any audio artifacts
		const totalDuration = 30; // Even shorter duration
		const steps = 6; // Fewer steps for faster execution
		const stepDuration = totalDuration / steps;
		let step = 0;
		
		// Ensure starting volumes are correct
		fadeOutAudio.volume = 1;
		fadeInAudio.volume = 0;
		
		const fade = () => {
			step++;
			const progress = step / steps;
			
			// Use easing for smoother transition
			const easeProgress = progress * progress * (3 - 2 * progress); // smoothstep
			
			fadeOutAudio.volume = Math.max(0, 1 - easeProgress);
			fadeInAudio.volume = Math.min(1, easeProgress);
			
			if (step < steps) {
				// Use requestAnimationFrame for smoother timing
				requestAnimationFrame(() => setTimeout(fade, stepDuration));
			} else {
				// Fade complete, stop the old audio
				fadeOutAudio.pause();
				fadeOutAudio.volume = 1; // Reset volume for next use
			}
		};
		
		// Start the fade immediately
		fade();
	}

	updateGuitarIconState() {
		if (this.guitarIcon) {
			if (this.hasGuitar) {
				this.guitarIcon.style.opacity = '1';
				this.guitarIcon.style.transform = 'scale(1)';
			} else {
				this.guitarIcon.style.opacity = '0.4';
				this.guitarIcon.style.transform = 'scale(0.9)';
			}
		}
	}

	toggleSpeedSlider() {
		this.isSpeedSliderVisible = !this.isSpeedSliderVisible;
		
		if (this.speedSliderWrapper) {
			if (this.isSpeedSliderVisible) {
				this.speedSliderWrapper.style.display = 'flex';
			} else {
				this.speedSliderWrapper.style.display = 'none';
			}
		}
		
		// Update the speed icon state
		this.updateSpeedIconState();
	}

	updateSpeedIconState() {
		if (this.speedIcon) {
			// Update opacity based on whether speed slider is visible
			this.speedIcon.style.opacity = this.isSpeedSliderVisible ? '1' : '0.6';
		}
	}

	updateSpeedSliderPosition() {
		if (this.speedSliderGrabber && this.speedSliderContainer) {
			// Convert speed percentage (40-125%) to position (0-1)
			const progress = (this.playbackSpeed - 40) / 85; // 85 = 125 - 40
			const containerWidth = 211; // Width of slider container
			const position = progress * containerWidth;
			
			this.speedSliderGrabber.style.left = `${position}px`;
		}
	}

	updateSpeedIndicator() {
		if (this.speedIndicator) {
			this.speedIndicator.textContent = `${this.playbackSpeed}%`;
		}
	}

	adjustSpeedByIncrement(increment) {
		// Smart rounding logic for 10% increments
		let newSpeed;
		
		if (increment > 0) {
			// For right arrow (increase): round up to next 10% boundary
			newSpeed = Math.ceil(this.playbackSpeed / 10) * 10;
			// If we're already at a 10% boundary, add the increment
			if (newSpeed === this.playbackSpeed) {
				newSpeed += increment;
			}
		} else {
			// For left arrow (decrease): round down to previous 10% boundary
			newSpeed = Math.floor(this.playbackSpeed / 10) * 10;
			// If we're already at a 10% boundary, add the increment (which is negative)
			if (newSpeed === this.playbackSpeed) {
				newSpeed += increment;
			}
		}
		
		// Ensure we stay within bounds (40% to 125%)
		newSpeed = Math.max(40, Math.min(125, newSpeed));
		
		// Update the speed
		this.playbackSpeed = newSpeed;
		this.updateSpeedSliderPosition();
		this.updateSpeedIndicator();
		
        // Apply time stretching
                this.updateTimeStretching();
        }

        updateTimeStretching() {
                const rate = this.playbackSpeed / 100;
                [this.primaryAudio, this.secondaryAudio].forEach(audio => {
                        audio.playbackRate = rate;
                        if ('preservesPitch' in audio) audio.preservesPitch = true;
                        if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = true;
                        if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = true;
                });
        }
}

class AudioWaveformPlayerPlugin extends Plugin {
	async onload() {
		console.log('Loading Audio Waveform Player plugin');

		// Register markdown post processor for code blocks
		this.registerMarkdownCodeBlockProcessor("audio-player", (source, el, ctx) => {
			this.processAudioPlayerBlock(source, el, ctx);
		});

		// Register command to insert audio player
		this.addCommand({
			id: 'insert-audio-player',
			name: 'Insert Audio Player',
			editorCallback: (editor, view) => {
				const audioPlayerBlock = `\`\`\`audio-player
src: your-audio-file.mp3
\`\`\``;
				editor.replaceSelection(audioPlayerBlock);
			}
		});
	}

	onunload() {
		console.log('Unloading Audio Waveform Player plugin');
	}

	processAudioPlayerBlock(source, element, context) {
		const config = this.parseAudioPlayerConfig(source);
		
		if (!config.src) {
			element.innerHTML = '<div style="color: red; padding: 10px;">Error: No audio source specified. Use "src: filename.mp3"</div>';
			return;
		}

		// Create the audio player
		const audioPlayer = new AudioWaveformPlayerComponent(element, config, this.app);
		audioPlayer.render();
	}

	parseAudioPlayerConfig(content) {
		const config = {};
		const lines = content.split('\n');
		
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.includes(':')) {
				const [key, ...valueParts] = trimmed.split(':');
				const value = valueParts.join(':').trim();
				
				switch (key.trim()) {
					case 'src':
					case 'source':
						config.src = value;
						break;
					case 'width':
						config.width = parseInt(value) || 500;
						break;
					case 'height':
						config.height = parseInt(value) || 150;
						break;
					case 'loop':
						config.loop = value.toLowerCase() === 'true';
						break;
					case 'autoplay':
						config.autoplay = value.toLowerCase() === 'true';
						break;
				}
			}
		}
		
		return config;
	}
}

module.exports = AudioWaveformPlayerPlugin;
