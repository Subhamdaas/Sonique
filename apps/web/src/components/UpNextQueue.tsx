import React, { useState } from 'react';
import {
  ArrowUpDown,
  Trash2,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Music2,
  Disc3,
  Plus,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import type { Playable } from '../types';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function UpNextQueue() {
  const {
    current,
    queue,
    isPlaying,
    setCurrent,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    smartQueueEnabled,
    smartQueueTracks,
    toggleSmartQueue,
    addToQueue,
  } = usePlayerStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filter upcoming queue (excluding current track or listing from current index onwards)
  const currentIndex = current ? queue.findIndex((t) => t.id === current.id) : -1;
  const upcomingQueue = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;

  const handlePlayQueuedTrack = (track: Playable) => {
    setCurrent(track, queue);
  };

  const handleMoveUp = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const actualIndex = currentIndex >= 0 ? currentIndex + 1 + index : index;
    if (actualIndex > 0) {
      reorderQueue(actualIndex, actualIndex - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const actualIndex = currentIndex >= 0 ? currentIndex + 1 + index : index;
    if (actualIndex < queue.length - 1) {
      reorderQueue(actualIndex, actualIndex + 1);
    }
  };

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const actualIndex = currentIndex >= 0 ? currentIndex + 1 + index : index;
    removeFromQueue(actualIndex);
  };

  // Drag and drop handlers
  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const actualFrom = currentIndex >= 0 ? currentIndex + 1 + draggedIndex : draggedIndex;
    const actualTo = currentIndex >= 0 ? currentIndex + 1 + targetIndex : targetIndex;
    reorderQueue(actualFrom, actualTo);
    setDraggedIndex(null);
  };

  return (
    <section className="retroUpNextQueueSection" aria-label="Up Next Playback Queue">
      {/* Queue Header Box */}
      <div className="queueHeaderBox">
        <div className="queueHeaderLeft">
          <div className="queueIconPill">
            <ArrowUpDown size={14} />
          </div>
          <h2 className="queueHeadingPixel">UP NEXT QUEUE</h2>
          <span className="queueCountBadge">
            {upcomingQueue.length} {upcomingQueue.length === 1 ? 'in queue' : 'in queue'}
          </span>
        </div>

        <div className="queueHeaderActions">
          <button
            className={`smartQueueToggleBtn ${smartQueueEnabled ? 'active' : ''}`}
            onClick={toggleSmartQueue}
            title={smartQueueEnabled ? 'Smart Queue enabled (Sonique Autoplay)' : 'Enable Smart Queue'}
            aria-label="Toggle Smart Queue"
          >
            <Sparkles size={13} />
            <span>SONIQUE AUTOPLAY</span>
          </button>

          {upcomingQueue.length > 0 && (
            <button
              className="queueClearBtn"
              onClick={clearQueue}
              title="Clear upcoming queue"
              aria-label="Clear queue"
            >
              <Trash2 size={13} />
              <span>CLEAR</span>
            </button>
          )}
        </div>
      </div>

      {/* Queue Items Table Container */}
      <div className="queueTableCard">
        {/* Currently Playing Track Highlight Row */}
        {current && (
          <div className="queueRow nowPlaying">
            <div className="queueRowLeft">
              <div className="queueCoverWrap">
                {current.coverUrl || (current as any).art ? (
                  <img
                    src={current.coverUrl || (current as any).art}
                    alt=""
                    className={`queueCoverImg ${isPlaying ? 'spinningMini' : ''}`}
                  />
                ) : (
                  <div className="queueCoverPlaceholder">
                    <Disc3 size={16} />
                  </div>
                )}
                {isPlaying && (
                  <div className="liveAudioIndicator">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>
              <div className="queueMetaColumn">
                <div className="nowPlayingBadgeRow">
                  <span className="nowPlayingBadge">NOW PLAYING</span>
                </div>
                <span className="queueTrackTitle">{current.title}</span>
                <span className="queueTrackArtist">
                  {(current as any).artist || (current as any).show?.title || 'Unknown Artist'}
                </span>
              </div>
            </div>

            <div className="queueRowRight">
              <span className="queueDurationDigital">
                {formatTime(current.duration || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Upcoming Tracks List */}
        {upcomingQueue.length > 0 ? (
          <div className="upcomingTracksScrollList">
            {upcomingQueue.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                className={`queueRow upcoming ${draggedIndex === i ? 'dragging' : ''}`}
                onClick={() => handlePlayQueuedTrack(track)}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(i)}
                role="button"
                tabIndex={0}
                aria-label={`Play queued song: ${track.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handlePlayQueuedTrack(track);
                }}
              >
                <div className="queueRowLeft">
                  <span className="queueItemIndexNumber">{i + 1}</span>
                  <div className="queueCoverWrap">
                    {track.coverUrl || (track as any).art ? (
                      <img
                        src={track.coverUrl || (track as any).art}
                        alt=""
                        className="queueCoverImg"
                      />
                    ) : (
                      <div className="queueCoverPlaceholder">
                        <Music2 size={16} />
                      </div>
                    )}
                    <button
                      className="queueRowPlayHover"
                      aria-label="Play now"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayQueuedTrack(track);
                      }}
                    >
                      <Play size={12} fill="#000" color="#000" />
                    </button>
                  </div>
                  <div className="queueMetaColumn">
                    <span className="queueTrackTitle">{track.title}</span>
                    <span className="queueTrackArtist">
                      {(track as any).artist || (track as any).show?.title || 'Unknown Artist'}
                    </span>
                  </div>
                </div>

                <div className="queueRowRight">
                  <span className="queueDurationDigital">
                    {formatTime(track.duration || 0)}
                  </span>

                  <div className="queueItemControls">
                    {i > 0 && (
                      <button
                        className="queueMiniCtrlBtn"
                        onClick={(e) => handleMoveUp(e, i)}
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                    )}
                    {i < upcomingQueue.length - 1 && (
                      <button
                        className="queueMiniCtrlBtn"
                        onClick={(e) => handleMoveDown(e, i)}
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}
                    <button
                      className="queueRemoveBtn"
                      onClick={(e) => handleRemove(e, i)}
                      title="Remove from queue"
                      aria-label="Remove from queue"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="queueEmptyStateBox">
            <span className="queueEmptyTitle">Your playback queue is clear</span>
            <span className="queueEmptySub">
              Add songs from categories or search to build your upcoming tracklist.
            </span>
          </div>
        )}

        {/* Smart Queue / Sonique Autoplay Suggestions Section */}
        {smartQueueEnabled && smartQueueTracks.length > 0 && (
          <div className="smartQueueSuggestionsArea">
            <div className="smartQueueHeaderBar">
              <div className="smartHeaderTitle">
                <Sparkles size={12} />
                <span>SONIQUE AUTOPLAY SUGGESTIONS</span>
              </div>
              <span className="smartSubtext">Will play automatically after your queue</span>
            </div>

            <div className="smartTracksList">
              {smartQueueTracks.slice(0, 3).map((smartTrk) => (
                <div
                  key={`smart-${smartTrk.id}`}
                  className="queueRow smartRow"
                  onClick={() => addToQueue(smartTrk)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Add suggestion to queue: ${smartTrk.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addToQueue(smartTrk);
                  }}
                >
                  <div className="queueRowLeft">
                    <div className="queueCoverWrap">
                      {smartTrk.coverUrl || (smartTrk as any).art ? (
                        <img
                          src={smartTrk.coverUrl || (smartTrk as any).art}
                          alt=""
                          className="queueCoverImg"
                        />
                      ) : (
                        <div className="queueCoverPlaceholder">
                          <Music2 size={14} />
                        </div>
                      )}
                    </div>
                    <div className="queueMetaColumn">
                      <span className="queueTrackTitle">{smartTrk.title}</span>
                      <span className="queueTrackArtist">
                        {(smartTrk as any).artist || (smartTrk as any).show?.title || 'Unknown Artist'}
                      </span>
                    </div>
                  </div>

                  <div className="queueRowRight">
                    <span className="queueDurationDigital">
                      {formatTime(smartTrk.duration || 0)}
                    </span>
                    <button
                      className="addSmartToQueueBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(smartTrk);
                      }}
                      title="Add to queue"
                      aria-label="Add to queue"
                    >
                      <Plus size={14} />
                      <span>ADD</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
