"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp, ChevronDown, ThumbsDown, Play, Share2 } from 'lucide-react'
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css"
import { Appbar } from "../components/Appbar";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { YT_REGEX } from "../lib/utils";
//@ts-ignore
import YouTubePlayer from "youtube-player";

interface Video {
  id: string
  type: string
  url: string
  extractedId: string
  title: string
  smallImg: string
  bigImg: string
  active: boolean
  userId: string
  upvotes: number
  haveUpvoted: boolean
}

const REFRESH_INTERVAL_MS = 10 * 1000

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string
  playVideo: boolean
}) {
  const [inputLink, setInputLink] = useState("")
  const [queue, setQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(false)
  const [playNextLoader, setPlayNextLoader] = useState(false)
  const videoPlayerRef = useRef<HTMLDivElement>(null)

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    })
    const json = await res.json()
    if (json.streams && Array.isArray(json.streams)) {
      setQueue(json.streams.sort((a: any, b: any) => (a.upvotes < b.upvotes ? 1 : -1)))
    } else {
      console.error("json.streams is undefined or not an array")
    }
    setCurrentVideo((video) => {
      if (video?.id === json.activeStream?.stream?.id) {
        return video
      }
      return json.activeStream.stream
    })
  }

  useEffect(() => {
    refreshStreams()
    const interval = setInterval(() => {
      refreshStreams()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [creatorId])

  useEffect(() => {
    if (!videoPlayerRef.current || !currentVideo) {
      return
    }
    let player = YouTubePlayer(videoPlayerRef.current)

    player.loadVideoById(currentVideo.extractedId)
    player.playVideo()

    function eventHandler(event: { data: number }) {
      if (event.data === 0) {
        playNext()
      }
    }
    player.on("stateChange", eventHandler)
    return () => {
      player.destroy()
    }
  }, [currentVideo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/streams/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creatorId,
        url: inputLink,
      }),
    })
    setQueue([...queue, await res.json()])
    setLoading(false)
    setInputLink("")
  }

  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(
      queue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
                haveUpvoted: !video.haveUpvoted,
              }
            : video
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    )

    fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: id,
      }),
    })
  }

  const playNext = async () => {
    if (queue.length > 0) {
      try {
        setPlayNextLoader(true)
        const data = await fetch("/api/streams/next", {
          method: "GET",
        })
        const json = await data.json()
        setCurrentVideo(json.stream)
        setQueue((q) => q.filter((x) => x.id !== json.stream?.id))
      } catch (e) {
        console.error("Error playing next video:", e)
      }
      setPlayNextLoader(false)
    }
  }

  const handleShare = () => {
    const shareableLink = `${window.location.hostname}/creator/${creatorId}`
    navigator.clipboard.writeText(shareableLink).then(
      () => {
        toast.success("Link copied to clipboard!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast.error("Failed to copy link. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    )
  }

  return (
    <div className="flex flex-col text-gray-200 min-h-screen bg-black">
      <Appbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold">Upcoming Songs</h2>
            {queue.length === 0 ? (
              <Card className="bg-gray-900">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No videos in queue</p>
                </CardContent>
              </Card>
            ) : (
              queue.map((video) => (
                <Card key={video.id} className="bg-gray-900">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <img
                      src={video.smallImg}
                      alt={`Thumbnail for ${video.title}`}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white">{video.title}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(video.id, !video.haveUpvoted)}
                          className="flex items-center space-x-1"
                        >
                          {video.haveUpvoted ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                          <span>{video.upvotes}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add a song</h2>
              <Button onClick={handleShare} variant="default">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Paste YouTube link here"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
              />
              <Button disabled={loading} type="submit" className="w-full">
                {loading ? "Loading..." : "Add to Queue"}
              </Button>
            </form>
            {inputLink && inputLink.match(YT_REGEX) && !loading && (
              <Card className="bg-gray-900">
                <CardContent className="p-4">
                  <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]} />
                </CardContent>
              </Card>
            )}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Now Playing</h2>
              <Card className="bg-gray-900">
                <CardContent className="p-4">
                  {currentVideo ? (
                    <div>
                      {playVideo ? (
                        <div ref={videoPlayerRef} className="w-full aspect-video" />
                      ) : (
                        <>
                          <img
                            src={currentVideo.bigImg}
                            alt={currentVideo.title}
                            className="w-full aspect-video object-cover rounded"
                          />
                          <p className="mt-2 text-center font-semibold text-white">{currentVideo.title}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No video playing</p>
                  )}
                </CardContent>
              </Card>
              {playVideo && (
                <Button
                  disabled={playNextLoader}
                  onClick={playNext}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {playNextLoader ? "Loading..." : "Play next"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}
