import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, Compass, Users, MessageCircle, Bell, Bookmark, Settings, Plus, Search, Heart, MessageSquare, Repeat2, Send, Sparkles, Image, Smile, Menu, X, ArrowRight, TrendingUp, MoreHorizontal } from "lucide-react";
import "./index.css";

const seedPosts = [
  { id: 1, name: "Maya Johnson", handle: "@mayaj", time: "18 min ago", initials: "MJ", tone: "lavender", text: "Small reminder: your progress doesn't have to look like anyone else's. Keep showing up for the things that matter to you. 💜", likes: 128, comments: 24 },
  { id: 2, name: "Daniel Okafor", handle: "@dancreates", time: "42 min ago", initials: "DO", tone: "peach", text: "Working on a new creative project this week. What's one thing you're learning right now?", likes: 86, comments: 17 },
  { id: 3, name: "Aisha Bello", handle: "@aishab", time: "1 hr ago", initials: "AB", tone: "mint", text: "Today's little win: I finally finished the book that has been sitting on my desk for months. What are you celebrating today?", likes: 204, comments: 31 }
];
const navigation = [
  { label: "Home", icon: Home }, { label: "Explore", icon: Compass }, { label: "Communities", icon: Users },
  { label: "Messages", icon: MessageCircle }, { label: "Notifications", icon: Bell }, { label: "Saved", icon: Bookmark }
];
function Avatar({ initials, tone = "lavender", size = "" }) {
  return <div className={"avatar " + tone + " " + size}>{initials}</div>;
}
function App() {
  const [active, setActive] = useState("Home");
  const [liked, setLiked] = useState([]);
  const [posts, setPosts] = useState(seedPosts);
  const [postText, setPostText] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }
  function publish() {
    if (!postText.trim()) return;
    setPosts([{ id: Date.now(), name: "You", handle: "@yourprofile", time: "Just now", initials: "YO", tone: "lavender", text: postText.trim(), likes: 0, comments: 0 }, ...posts]);
    setPostText("");
    setComposerOpen(false);
    notify("Post added to this local preview.");
  }
  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X size={20}/> : <Menu size={20}/>}</button>
      <button className="brand" onClick={() => setActive("Home")}><span className="brand-mark">g</span><span>gist<span className="brand-up">up</span></span></button>
      <label className="searchbox"><Search size={18}/><input aria-label="Search" placeholder="Search people, topics, and communities" onKeyDown={e => { if (e.key === "Enter") { setActive("Explore"); notify("Search will be connected in a later development step."); } }}/><kbd>⌘ K</kbd></label>
      <div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setActive("Notifications")}><Bell size={20}/><i/></button><Avatar initials="YO" size="small"/><span className="profile-name">Your profile</span></div>
    </header>
    {notice && <div className="toast" role="status">{notice}</div>}
    <div className="layout">
      <aside className={"left-sidebar " + (mobileNav ? "open" : "")}>
        <div className="sidebar-label">MENU</div>
        {navigation.map(({label, icon: Icon}) => <button key={label} className={"nav-item " + (active === label ? "selected" : "")} onClick={() => { setActive(label); setMobileNav(false); }}><Icon size={19}/><span>{label}</span>{label === "Notifications" && <b className="nav-count">3</b>}</button>)}
        <div className="sidebar-divider"/><div className="sidebar-label">YOUR SPACE</div>
        <button className={"nav-item " + (active === "Creator Studio" ? "selected" : "")} onClick={() => setActive("Creator Studio")}><Sparkles size={19}/><span>Creator Studio</span></button>
        <button className={"nav-item " + (active === "Settings & Privacy" ? "selected" : "")} onClick={() => setActive("Settings & Privacy")}><Settings size={19}/><span>Settings & Privacy</span></button>
        <div className="sidebar-card"><div className="sidebar-card-icon"><Sparkles size={18}/></div><strong>Make your space yours</strong><p>Find your people and join conversations that matter to you.</p><button onClick={() => setActive("Explore")}>Explore Gist Up <ArrowRight size={14}/></button></div>
        <div className="sidebar-footer">About · Guidelines · Privacy<p>© 2026 Gist Up</p></div>
      </aside>
      <main className="feed-column">
        <div className="page-heading"><div><p className="eyebrow">YOUR COMMUNITY, YOUR WAY</p><h1>{active === "Home" ? "Your feed" : active}</h1><p className="muted">{active === "Home" ? "Catch up with the people and ideas you care about." : "This section will be built and connected in stages."}</p></div><button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={18}/> Create post</button></div>
        {active === "Home" ? <>
          <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-pill"><Sparkles size={13}/> YOUR PEOPLE. YOUR STORIES.</span><h2>A little more connection.<br/><span>A lot more you.</span></h2><p>A place to share your story, discover new perspectives, and find your people.</p><button onClick={() => setActive("Explore")}>Find your community <ArrowRight size={16}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-card art-card-one"><span>✦</span><b>Good energy</b><small>starts here</small></div><div className="art-card art-card-two"><div className="mini-avatars"><i>M</i><i>D</i><i>A</i></div><b>Find your people</b><small>Make real connections</small></div><div className="art-sparkle">✦</div></div></section>
          <section className="composer-card"><Avatar initials="YO" size="medium"/><button className="composer-placeholder" onClick={() => setComposerOpen(true)}>What's on your mind?</button><button className="composer-tool" aria-label="Add photo" onClick={() => setComposerOpen(true)}><Image size={19}/></button><button className="composer-tool" aria-label="Add feeling" onClick={() => setComposerOpen(true)}><Smile size={19}/></button><button className="composer-post" onClick={() => setComposerOpen(true)}>Post</button></section>
          <div className="feed-tabs"><button className="tab-active">For you</button><button onClick={() => setActive("Explore")}>Following</button><button onClick={() => setActive("Explore")}>Trending</button><span className="feed-sort">Latest <MoreHorizontal size={18}/></span></div>
          {posts.map(post => <article className="post-card" key={post.id}><div className="post-header"><Avatar initials={post.initials} tone={post.tone}/><div className="post-author"><strong>{post.name}</strong><span>{post.handle} · {post.time}</span></div><button className="icon-button post-more" aria-label="More post options" onClick={() => notify("Post options will be connected in a later step.")}><MoreHorizontal size={21}/></button></div><p className="post-copy">{post.text}</p><div className="post-tag"># community</div><div className="post-stats"><span>{post.likes + (liked.includes(post.id) ? 1 : 0)} likes</span><span>{post.comments} comments</span></div><div className="post-actions"><button className={liked.includes(post.id) ? "liked" : ""} onClick={() => setLiked(old => old.includes(post.id) ? old.filter(id => id !== post.id) : [...old, post.id])}><Heart size={18} fill={liked.includes(post.id) ? "currentColor" : "none"}/> Like</button><button onClick={() => notify("Comments will be connected when the backend is added.")}><MessageSquare size={18}/> Comment</button><button onClick={() => notify("Reposting will be connected in a later step.")}><Repeat2 size={18}/> Repost</button><button aria-label="Send post" onClick={() => notify("Messaging will be connected in a later step.")}><Send size={18}/></button></div></article>)}
        </> : <section className="placeholder-page"><div className="placeholder-icon"><Sparkles size={28}/></div><h2>{active}</h2><p>This screen is part of the Gist Up plan. Its full feature set will be built and connected in stages.</p><button className="primary-button" onClick={() => setActive("Home")}><Home size={17}/> Return to Home</button></section>}
      </main>
      <aside className="right-sidebar">
        <section className="right-card profile-card"><div className="profile-cover"/><div className="profile-card-body"><Avatar initials="YO" size="large"/><strong>Your profile</strong><span>@yourprofile</span><p>Your story starts here. Add a bio and let people get to know you.</p><div className="profile-metrics"><div><b>0</b><span>Following</span></div><div><b>0</b><span>Followers</span></div><div><b>{posts.length}</b><span>Posts</span></div></div><button className="outline-button" onClick={() => setActive("Profile")}>View profile</button></div></section>
        <section className="right-card trends-card"><div className="right-card-heading"><h3><TrendingUp size={17}/> What's happening</h3><button onClick={() => setActive("Explore")}>See all</button></div>{[["#CreativeCommunity","2.4k posts","Creators"],["#MondayMotivation","1.8k posts","Lifestyle"],["#DesignTalk","956 posts","Technology"]].map(([tag,count,category]) => <button className="trend-row" key={tag} onClick={() => setActive("Explore")}><span>{category} · Trending</span><strong>{tag}</strong><small>{count}</small></button>)}</section>
        <section className="right-card suggestions-card"><div className="right-card-heading"><h3>People to know</h3><button onClick={() => setActive("Explore")}>See all</button></div>{[["Nia Carter","@niacreates","NC","lavender"],["Tobi Adeyemi","@tobiwrites","TA","mint"],["Leah Morgan","@leahm","LM","peach"]].map(([name,handle,initials,tone]) => <div className="suggestion-row" key={handle}><Avatar initials={initials} tone={tone}/><div className="suggestion-info"><strong>{name}</strong><span>{handle}</span></div><button className="follow-button" onClick={() => notify("Following will be connected when accounts are implemented.")}>Follow</button></div>)}</section>
        <footer className="right-footer">About · Help · Community Guidelines<br/>Privacy · Terms · Cookies<br/><span>© 2026 Gist Up</span></footer>
      </aside>
    </div>
    {composerOpen && <div className="modal-backdrop" onClick={() => setComposerOpen(false)}><section className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onClick={e => e.stopPropagation()}><div className="modal-heading"><h2 id="composer-title">Create a post</h2><button className="icon-button" aria-label="Close" onClick={() => setComposerOpen(false)}><X size={20}/></button></div><div className="modal-user"><Avatar initials="YO" size="medium"/><div><strong>Your profile</strong><span>Sharing with everyone</span></div></div><textarea autoFocus value={postText} onChange={e => setPostText(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/><div className="modal-bottom"><span>{postText.length}/5000</span><button className="primary-button" disabled={!postText.trim()} onClick={publish}>Publish post <ArrowRight size={16}/></button></div><p className="preview-note">Preview only: posts are stored in this page session, not on a server.</p></section></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);
