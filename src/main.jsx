import React, { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import { createRoot } from "react-dom/client";
import { Home, Compass, Users, MessageCircle, Bell, Bookmark, Settings, Plus, Search, Heart, MessageSquare, Repeat2, Send, Sparkles, Image as ImageIcon, Smile, Menu, X, ArrowRight, TrendingUp, MoreHorizontal, UserRound, ShieldCheck, SlidersHorizontal, Hash, Mail, Lock, Eye, EyeOff, ChevronRight, Check, Paperclip, SmilePlus, BarChart3, Megaphone, WandSparkles, CircleHelp, LogOut, Globe2, Moon, Shield, Trash2, Archive, Ban, Camera, Pencil, Share2, Flame, Clock, UserPlus, FileText, Bot, ArrowUpRight } from "lucide-react";
import "./index.css";

const seedPosts = [
  { id: 1, name: "Maya Johnson", handle: "@mayaj", time: "18 min ago", initials: "MJ", tone: "lavender", text: "Small reminder: your progress doesn't have to look like anyone else's. Keep showing up for the things that matter to you. 💜", likes: 128, comments: 24, topic: "Lifestyle" },
  { id: 2, name: "Daniel Okafor", handle: "@dancreates", time: "42 min ago", initials: "DO", tone: "peach", text: "Working on a new creative project this week. What's one thing you're learning right now?", likes: 86, comments: 17, topic: "Creators" },
  { id: 3, name: "Aisha Bello", handle: "@aishab", time: "1 hr ago", initials: "AB", tone: "mint", text: "Today's little win: I finally finished the book that has been sitting on my desk for months. What are you celebrating today?", likes: 204, comments: 31, topic: "Community" }
];
const people = [
  { name: "Nia Carter", handle: "@niacreates", initials: "NC", tone: "lavender", bio: "Illustrator, storyteller & professional daydreamer." },
  { name: "Tobi Adeyemi", handle: "@tobiwrites", initials: "TA", tone: "mint", bio: "Writing about culture, creativity and everyday life." },
  { name: "Leah Morgan", handle: "@leahm", initials: "LM", tone: "peach", bio: "Finding joy in little things. Coffee enthusiast." },
  { name: "Daniel Okafor", handle: "@dancreates", initials: "DO", tone: "peach", bio: "Designer sharing works in progress and lessons." }
];
const navigation = [
  { label: "Home", icon: Home }, { label: "Explore", icon: Compass }, { label: "Communities", icon: Users },
  { label: "Messages", icon: MessageCircle }, { label: "Notifications", icon: Bell }, { label: "Saved", icon: Bookmark }
];
const spaces = [
  { name: "Creator Studio", icon: Sparkles, desc: "Create and understand your content." },
  { name: "AI Assistant", icon: Bot, desc: "Brainstorm ideas and polish your writing." },
  { name: "Ads Manager", icon: Megaphone, desc: "Plan and review promotional campaigns." },
  { name: "Settings & Privacy", icon: Settings, desc: "Manage your account and preferences." }
];
const conversations = [
  { name: "Nia Carter", handle: "@niacreates", initials: "NC", tone: "lavender", message: "That idea sounds amazing!", time: "2m", unread: true },
  { name: "Tobi Adeyemi", handle: "@tobiwrites", initials: "TA", tone: "mint", message: "Sent you the draft ✨", time: "1h", unread: true },
  { name: "Leah Morgan", handle: "@leahm", initials: "LM", tone: "peach", message: "Thank you so much!", time: "Yesterday", unread: false }
];
function Avatar({ initials, tone = "lavender", size = "" }) { return <div className={"avatar " + tone + " " + size}>{initials}</div>; }
function App() {
  const [active, setActive] = useState("Home");
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState(seedPosts);
  const [postText, setPostText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentPost, setCommentPost] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [messageActive, setMessageActive] = useState(0);
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState({});
  const [settingsTab, setSettingsTab] = useState("Account");
  const [authMode, setAuthMode] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileTab, setProfileTab] = useState("Posts");
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [communityJoined, setCommunityJoined] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [archived, setArchived] = useState([]);
  const [profileBio, setProfileBio] = useState("Your story starts here. Add a bio and let people get to know you.");
  const [editProfile, setEditProfile] = useState(false);
  const [displayName, setDisplayName] = useState("Your profile");
  const [handle, setHandle] = useState("@yourprofile");
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError(error.message);
      const user = data?.session?.user || null;
      setAuthUser(user);
      if (user) {
        setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Your profile");
        setHandle("@" + (user.email?.split("@")[0] || "member").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0,24));
        setAuthMode("app");
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const user = session?.user || null;
      setAuthUser(user);
      if (user) {
        setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Your profile");
        setHandle("@" + (user.email?.split("@")[0] || "member").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0,24));
        setAuthMode("app");
      } else {
        setAuthMode(current => current === "app" ? "welcome" : current);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function submitAuth() {
    setAuthError("");
    if (!isSupabaseConfigured || !supabase) {
      setAuthError("Account sign-in is not configured on the live site yet. Please try again later.");
      return;
    }
    if (!email.trim() || !password) { setAuthError("Enter your email address and password."); return; }
    if (authMode === "signup" && !fullName.trim()) { setAuthError("Enter your full name."); return; }
    if (password.length < 8) { setAuthError("Your password must be at least 8 characters."); return; }
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(), password,
          options: { data: { full_name: fullName.trim() } }
        });
        if (error) throw error;
        if (data.session) {
          setAuthUser(data.user);
          setDisplayName(fullName.trim());
          setHandle("@" + email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0,24));
          setAuthMode("app");
          notify("Welcome to Gist Up! Your account is ready.");
        } else {
          setAuthError("Account created. Check your email for a confirmation link, then log in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        setAuthUser(data.user);
        setDisplayName(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Your profile");
        setHandle("@" + data.user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0,24));
        setAuthMode("app");
        notify("You're logged in.");
      }
    } catch (error) {
      setAuthError(error?.message || "We couldn't complete sign-in. Please try again.");
    } finally { setAuthBusy(false); }
  }

  async function signOut() {
    if (supabase && authUser) {
      const { error } = await supabase.auth.signOut();
      if (error) { notify(error.message); return; }
    }
    setAuthUser(null);
    setAuthMode("welcome");
    setPassword("");
    notify("You've signed out.");
  }

  function notify(message) { setNotice(message); window.setTimeout(() => setNotice(""), 2800); }
  function publish() {
    if (!postText.trim()) return;
    setPosts([{ id: Date.now(), name: displayName, handle, time: "Just now", initials: displayName.split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase(), tone: "lavender", text: postText.trim(), likes: 0, comments: 0, topic: "Your post" }, ...posts]);
    setPostText(""); setComposerOpen(false); setActive("Home"); notify("Your post was added to this preview.");
  }
  function go(label) { setActive(label); setMobileNav(false); }
  function toggleFollow(person) { setFollowing(old => old.includes(person.handle) ? old.filter(x => x !== person.handle) : [...old, person.handle]); }
  function sendMessage() {
    if (!messageDraft.trim()) return;
    const key = conversations[messageActive].handle;
    setMessages(old => ({ ...old, [key]: [...(old[key] || []), { from: "You", text: messageDraft.trim(), time: "Now" }] }));
    setMessageDraft("");
  }
  const filteredPeople = useMemo(() => people.filter(p => (p.name + " " + p.handle + " " + p.bio).toLowerCase().includes(query.toLowerCase())), [query]);
  const myInitials = displayName.split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase() || "YO";
  const titleCopy = {
    Home: ["Your feed", "Catch up with the people and ideas you care about."],
    Explore: ["Explore", "Find conversations, people and ideas worth your time."],
    Communities: ["Communities", "Find your people around the things you love."],
    Messages: ["Messages", "Keep the conversation going."],
    Notifications: ["Notifications", "The latest from your Gist Up community."],
    Saved: ["Saved posts", "Keep the posts you want to come back to."],
    Profile: ["Your profile", "Your corner of Gist Up, shaped by you."],
    "Creator Studio": ["Creator Studio", "A home for your ideas, posts and creative progress."],
    "AI Assistant": ["AI Assistant", "A thoughtful helper for your next idea."],
    "Ads Manager": ["Ads Manager", "Manage promotional ideas and campaign drafts."],
    "Settings & Privacy": ["Settings & Privacy", "Your account, your choices."]
  };
  function HeaderTitle() {
    const [title, subtitle] = titleCopy[active] || [active, "Make this space yours."];
    return <div className="page-heading"><div><p className="eyebrow">YOUR PEOPLE. YOUR STORIES.</p><h1>{title}</h1><p className="muted">{subtitle}</p></div>{["Home","Profile"].includes(active) && <button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={18}/> Create post</button>}</div>;
  }
  function PostCard({ post }) {
    const isLiked = liked.includes(post.id);
    return <article className="post-card" key={post.id}>
      <div className="post-header"><Avatar initials={post.initials} tone={post.tone}/><div className="post-author"><strong>{post.name}</strong><span>{post.handle} · {post.time}</span></div><button className="icon-button post-more" aria-label="Post options" onClick={() => { setSaved(old => old.includes(post.id) ? old.filter(x => x !== post.id) : [...old, post.id]); notify(saved.includes(post.id) ? "Removed from Saved." : "Post saved."); }}><MoreHorizontal size={21}/></button></div>
      <p className="post-copy">{post.text}</p><div className="post-tag"># {post.topic || "community"}</div>
      <div className="post-stats"><span>{post.likes + (isLiked ? 1 : 0)} likes</span><span>{post.comments} comments</span></div>
      <div className="post-actions"><button className={isLiked ? "liked" : ""} onClick={() => setLiked(old => isLiked ? old.filter(id => id !== post.id) : [...old, post.id])}><Heart size={18} fill={isLiked ? "currentColor" : "none"}/> Like</button><button onClick={() => { setCommentPost(post.id); setCommentText(""); }}><MessageSquare size={18}/> Comment</button><button onClick={() => notify("Repost preview: this action is not yet connected to a server.")}><Repeat2 size={18}/> Repost</button><button aria-label="Share post" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(()=>{}); notify("Share link copied when clipboard access is available."); }}><Share2 size={18}/></button><button aria-label="Save post" className={saved.includes(post.id) ? "liked" : ""} onClick={() => { setSaved(old => old.includes(post.id) ? old.filter(x => x !== post.id) : [...old, post.id]); notify(saved.includes(post.id) ? "Removed from Saved." : "Post saved."); }}><Bookmark size={18} fill={saved.includes(post.id) ? "currentColor" : "none"}/></button></div>
    </article>;
  }
  function HomePage() {
    return <>
      <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-pill"><Sparkles size={13}/> YOUR PEOPLE. YOUR STORIES.</span><h2>A little more connection.<br/><span>A lot more you.</span></h2><p>A place to share your story, discover new perspectives, and find your people.</p><button onClick={() => go("Explore")}>Find your community <ArrowRight size={16}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-card art-card-one"><span>✦</span><b>Good energy</b><small>starts here</small></div><div className="art-card art-card-two"><div className="mini-avatars"><i>M</i><i>D</i><i>A</i></div><b>Find your people</b><small>Make real connections</small></div><div className="art-sparkle">✦</div></div></section>
      <section className="composer-card"><Avatar initials={myInitials} size="medium"/><button className="composer-placeholder" onClick={() => setComposerOpen(true)}>What's on your mind?</button><button className="composer-tool" aria-label="Add photo" onClick={() => setComposerOpen(true)}><ImageIcon size={19}/></button><button className="composer-tool" aria-label="Add feeling" onClick={() => setComposerOpen(true)}><Smile size={19}/></button><button className="composer-post" onClick={() => setComposerOpen(true)}>Post</button></section>
      <div className="feed-tabs"><button className="tab-active">For you</button><button onClick={() => notify("Following feed will reflect accounts you follow once sign-in is connected.")}>Following</button><button onClick={() => go("Explore")}>Trending</button><span className="feed-sort">Latest <MoreHorizontal size={18}/></span></div>
      {posts.map(post => <PostCard post={post} key={post.id}/>)}
    </>;
  }
  function ExplorePage() {
    const topics = [["#CreativeCommunity","2.4k posts","Creators"],["#MondayMotivation","1.8k posts","Lifestyle"],["#DesignTalk","956 posts","Technology"],["#BooksAndBeyond","741 posts","Culture"]];
    return <div className="screen-stack"><div className="search-large"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people, topics, and communities"/></div><section className="feature-panel explore-feature"><div><span className="welcome-pill"><Flame size={13}/> TRENDING NOW</span><h2>What's the world talking about?</h2><p>Discover conversations and communities that spark your curiosity.</p></div><Compass size={54}/></section><section className="content-panel"><div className="section-title"><h2>People you might like</h2><span>{filteredPeople.length} suggestions</span></div>{filteredPeople.map(p=><div className="person-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div className="person-copy"><strong>{p.name}</strong><span>{p.handle}</span><p>{p.bio}</p></div><button className={following.includes(p.handle)?"follow-button following":"follow-button"} onClick={()=>toggleFollow(p)}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}{!filteredPeople.length&&<p className="empty-state">No people found. Try another search.</p>}</section><section className="content-panel"><div className="section-title"><h2>Trending topics</h2><button className="text-button" onClick={()=>notify("You're viewing all trending topics in this preview.")}>See all</button></div><div className="topic-grid">{topics.map(([tag,count,category])=><button className="topic-card" key={tag} onClick={()=>{setQuery(tag.replace("#",""));notify("Topic selected: "+tag)}}><span>{category} · Trending</span><strong>{tag}</strong><small>{count}</small><ArrowUpRight size={16}/></button>)}</div></section><section className="content-panel"><div className="section-title"><h2>Posts worth a look</h2><span>For you</span></div>{posts.slice(0,2).map(post=><PostCard post={post} key={post.id}/>)}</section></div>;
  }
  function CommunitiesPage() {
    const groups=[["Creative Corner","Share your work, get feedback, and meet fellow creatives.","12.8k members","CC","lavender"],["Everyday Wins","A little space to celebrate big and small moments.","8.4k members","EW","mint"],["Design & Digital","Ideas, inspiration and thoughtful design conversations.","6.2k members","DD","peach"],["Book Club","For readers, reviewers and people who love a good story.","4.1k members","BC","lavender"]];
    return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"><Users size={13}/> FIND YOUR PEOPLE</span><h2>Belong to something good.</h2><p>Join spaces where you can share, learn, and feel at home.</p></div><Users size={54}/></section><div className="section-title"><h2>Communities to explore</h2><button className="outline-button compact" onClick={()=>notify("Community creation will be available after account and server setup.")}><Plus size={15}/> Create community</button></div><div className="community-grid">{groups.map(([name,desc,count,initials,tone])=><article className="community-card" key={name}><div className={"community-art "+tone}><Avatar initials={initials} tone={tone} size="large"/></div><div className="community-card-body"><h3>{name}</h3><p>{desc}</p><span><Users size={14}/> {count}</span><button className={communityJoined.includes(name)?"outline-button":"primary-button"} onClick={()=>setCommunityJoined(old=>old.includes(name)?old.filter(x=>x!==name):[...old,name])}>{communityJoined.includes(name)?<><Check size={15}/> Joined</>:<>Join community <ArrowRight size={15}/></>}</button></div></article>)}</div></div>;
  }
  function MessagesPage() {
    const current=conversations[messageActive];
    const thread=[{from:current.name,text:"Hey! I saw your post and wanted to say I really liked your perspective.",time:"10:24 AM"},{from:"You",text:"Thank you! I appreciate you taking the time to read it.",time:"10:29 AM"},{from:current.name,text:current.message,time:current.time},...(messages[current.handle]||[])];
    return <div className="messages-layout"><section className="message-list-panel"><div className="message-list-head"><h2>Chats</h2><button className="icon-button" onClick={()=>notify("New message search will be connected to accounts.")}><Pencil size={17}/></button></div><div className="search-small"><Search size={16}/><input placeholder="Search messages"/></div><div className="message-filters"><button className="tab-active">All</button><button onClick={()=>setArchived(old=>old.length?[]:conversations.map(c=>c.handle))}>Archived</button></div>{conversations.filter(c=>!archived.includes(c.handle)).map((c,i)=><button className={"conversation-row "+(messageActive===i?"conversation-active":"")} key={c.handle} onClick={()=>setMessageActive(i)}><Avatar initials={c.initials} tone={c.tone}/><span className="conversation-copy"><strong>{c.name}</strong><small>{c.message}</small></span><span className="conversation-meta"><small>{c.time}</small>{c.unread&&<i/>}</span></button>)}</section><section className="chat-panel"><div className="chat-head"><Avatar initials={current.initials} tone={current.tone}/><div><strong>{current.name}</strong><span>{current.handle}</span></div><button className="icon-button" onClick={()=>notify("Conversation options: block and archive are available in Settings & Privacy.")}><MoreHorizontal size={20}/></button></div><div className="chat-history"><div className="chat-date">TODAY</div>{thread.map((m,i)=><div className={"chat-message "+(m.from==="You"?"mine":"")} key={i}><p>{m.text}</p><small>{m.time}</small></div>)}</div><div className="chat-compose"><button className="icon-button" onClick={()=>notify("Attachments are not enabled in this preview.")}><Paperclip size={18}/></button><input value={messageDraft} onChange={e=>setMessageDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Write a message…"/><button className="icon-button" onClick={()=>notify("Emoji picker will be added later.")}><SmilePlus size={18}/></button><button className="primary-button send-message" onClick={sendMessage} disabled={!messageDraft.trim()}><Send size={16}/></button></div><p className="preview-note chat-note">Preview messages stay in this browser session and are not delivered to real accounts.</p></section></div>;
  }
  function NotificationsPage() {
    const items=[["NC","Nia Carter","started following you.","2 min ago","lavender"],["TA","Tobi Adeyemi","mentioned you in a conversation.","1 hr ago","mint"],["LM","Leah Morgan","liked your post.","3 hr ago","peach"],["G","Gist Up","Welcome! Start by finding people and topics you enjoy.","Yesterday","lavender"]];
    return <div className="content-panel notifications-panel"><div className="notification-tabs">{["All","Mentions","Follows"].map(t=><button className={notificationFilter===t?"tab-active":""} onClick={()=>setNotificationFilter(t)} key={t}>{t}</button>)}<button className="text-button mark-read" onClick={()=>notify("All notifications marked as read in this preview.")}>Mark all as read</button></div>{items.filter((it,i)=>notificationFilter==="All"||(notificationFilter==="Mentions"&&i===1)||(notificationFilter==="Follows"&&i===0)).map(([initials,name,action,time,tone],i)=><div className="notification-row" key={name}><Avatar initials={initials} tone={tone}/><div><p><strong>{name}</strong> {action}</p><span>{time}</span></div>{i===0&&<i/>}</div>)}</div>;
  }
  function SavedPage() { const savedPosts=posts.filter(p=>saved.includes(p.id)); return <div className="screen-stack">{savedPosts.length?savedPosts.map(post=><PostCard post={post} key={post.id}/>):<div className="empty-panel"><div className="placeholder-icon"><Bookmark size={27}/></div><h2>Your saved posts live here</h2><p>Tap the bookmark on a post to keep it close for later.</p><button className="primary-button" onClick={()=>go("Home")}>Explore your feed <ArrowRight size={16}/></button></div>}</div>; }
  function ProfilePage() {
    const myPosts=posts.filter(p=>p.handle===handle);
    return <div className="screen-stack"><section className="profile-page-card"><div className="profile-page-cover"><button className="cover-edit" onClick={()=>notify("Cover photo upload will be connected later.")}><Camera size={15}/> Edit cover</button></div><div className="profile-page-body"><Avatar initials={myInitials} size="profile-avatar"/><button className="outline-button edit-profile-button" onClick={()=>setEditProfile(true)}><Pencil size={14}/> Edit profile</button><h2>{displayName}</h2><span className="profile-handle">{handle}</span><p>{profileBio}</p><div className="profile-page-stats"><span><b>{myPosts.length}</b> posts</span><span><b>{following.length}</b> following</span><span><b>0</b> followers</span></div><div className="profile-tabs">{["Posts","Replies","Media","Likes"].map(t=><button className={profileTab===t?"tab-active":""} onClick={()=>setProfileTab(t)} key={t}>{t}</button>)}</div></div></section>{profileTab==="Posts"&&myPosts.length?myPosts.map(post=><PostCard post={post} key={post.id}/>):<div className="empty-panel compact-empty"><h3>{profileTab==="Posts"?"Your story starts with a post":profileTab+" will appear here"}</h3><p>{profileTab==="Posts"?"Share something with your community to get started.":"This profile section is empty in the current preview."}</p><button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create post</button></div>}</div>;
  }
  function CreatorStudioPage() {
    return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"><Sparkles size={13}/> CREATOR SPACE</span><h2>Make something meaningful.</h2><p>Draft your next post, review your recent activity, and keep your ideas moving.</p><button className="primary-button" onClick={()=>setComposerOpen(true)}><Plus size={16}/> Create a post</button></div><WandSparkles size={58}/></section><div className="stats-grid"><div className="stat-card"><span>Posts in preview</span><b>{posts.filter(p=>p.handle===handle).length}</b><small><FileText size={14}/> Published drafts</small></div><div className="stat-card"><span>Total likes</span><b>{posts.filter(p=>p.handle===handle).reduce((n,p)=>n+p.likes,0)}</b><small><Heart size={14}/> Engagement preview</small></div><div className="stat-card"><span>Following</span><b>{following.length}</b><small><Users size={14}/> Your connections</small></div></div><section className="content-panel"><div className="section-title"><h2>Your recent posts</h2><button className="text-button" onClick={()=>go("Profile")}>View profile</button></div>{posts.filter(p=>p.handle===handle).length?posts.filter(p=>p.handle===handle).map(p=><PostCard post={p} key={p.id}/>):<p className="empty-state">You haven't published a post in this preview yet.</p>}</section><section className="content-panel"><div className="section-title"><h2>Creator tools</h2></div><div className="tool-grid"><button onClick={()=>setComposerOpen(true)}><Pencil size={19}/><strong>Post composer</strong><span>Write and share an update</span></button><button onClick={()=>go("Explore")}><TrendingUp size={19}/><strong>Discover trends</strong><span>Find relevant conversations</span></button><button onClick={()=>go("AI Assistant")}><Bot size={19}/><strong>Idea assistant</strong><span>Get help with your next idea</span></button></div></section></div>;
  }
  function AssistantPage() { return <div className="assistant-page"><section className="assistant-hero"><div className="assistant-orb"><Sparkles size={28}/></div><span className="welcome-pill">GIST UP AI</span><h2>What are we creating today?</h2><p>Brainstorm post ideas, refine a caption, or find a fresh way to tell your story.</p><div className="prompt-chips">{["Give me post ideas","Improve my caption","Suggest a community topic"].map(x=><button key={x} onClick={()=>setAssistantPrompt(x)}>{x}</button>)}</div></section>{assistantReply&&<div className="assistant-reply"><Avatar initials="AI" tone="lavender"/><div><strong>Gist Up Assistant · Preview</strong><p>{assistantReply}</p><small>This is a local sample response, not a connected AI service.</small></div></div>}<div className="assistant-input"><textarea value={assistantPrompt} onChange={e=>setAssistantPrompt(e.target.value)} placeholder="Tell me what you want help with…"/><button className="primary-button" onClick={()=>{if(assistantPrompt.trim()){setAssistantReply("Here’s a simple way to start: choose one clear idea, write it in your natural voice, and end with a question that invites others to share their perspective. Your prompt: “"+assistantPrompt.trim()+"”. Try making it personal, specific, and welcoming.");}}} disabled={!assistantPrompt.trim()}><Send size={16}/> Ask assistant</button></div></div>; }
  function AdsManagerPage() { return <div className="screen-stack"><section className="feature-panel"><div><span className="welcome-pill"><Megaphone size={13}/> PROMOTION WORKSPACE</span><h2>Help the right people find you.</h2><p>Plan campaign ideas and keep an overview of drafts before any ad delivery is connected.</p><button className="primary-button" onClick={()=>notify("Campaign creation is a design preview only. No ad will run.")}><Plus size={16}/> Create campaign</button></div><BarChart3 size={56}/></section><div className="stats-grid"><div className="stat-card"><span>Campaign drafts</span><b>0</b><small><FileText size={14}/> Nothing launched</small></div><div className="stat-card"><span>Reach</span><b>—</b><small>Not connected</small></div><div className="stat-card"><span>Spend</span><b>₦0</b><small>No billing connected</small></div></div><section className="content-panel"><h2 className="panel-heading">Campaign workspace</h2><div className="empty-state-box"><Megaphone size={26}/><strong>No campaigns yet</strong><p>Your drafts will appear here. This preview does not run paid promotions or collect payments.</p></div></section></div>; }
  function SettingsPage() {
    const tabs=["Account","Privacy","Notifications","Appearance","Blocked accounts","Data & account"];
    return <div className="settings-layout"><section className="settings-menu">{tabs.map(t=><button key={t} className={settingsTab===t?"settings-selected":""} onClick={()=>setSettingsTab(t)}>{t==="Account"?<UserRound size={17}/>:t==="Privacy"?<Shield size={17}/>:t==="Notifications"?<Bell size={17}/>:t==="Appearance"?<Moon size={17}/>:t==="Blocked accounts"?<Ban size={17}/>:<Lock size={17}/>} {t}<ChevronRight size={15}/></button>)}</section><section className="settings-content"><h2>{settingsTab}</h2><p className="muted">Manage how Gist Up works for you.</p>{settingsTab==="Account"&&<><div className="setting-row"><div><strong>Profile information</strong><span>Change your name, handle and bio.</span></div><button className="outline-button compact" onClick={()=>setEditProfile(true)}>Edit profile</button></div><div className="setting-row"><div><strong>Email address</strong><span>{email||"Not connected in preview"}</span></div><button className="text-button" onClick={()=>notify("Email changes require a connected account.")}>Manage</button></div><div className="setting-row"><div><strong>Password & security</strong><span>Sign-in security is not connected yet.</span></div><Lock size={18}/></div></>}{settingsTab==="Privacy"&&<><div className="setting-row"><div><strong>Private account</strong><span>Review who can follow and see your posts.</span></div><button className={"toggle "+(privateAccount?"toggle-on":"")} onClick={()=>setPrivateAccount(!privateAccount)} aria-label="Toggle private account"><i/></button></div><div className="setting-row"><div><strong>Message requests</strong><span>Choose who can start a conversation.</span></div><button className="text-button" onClick={()=>notify("Message request controls are a preview.")}>Manage</button></div><div className="setting-row"><div><strong>Discoverability</strong><span>Control how people find your profile.</span></div><button className="text-button" onClick={()=>notify("Discoverability controls will be connected later.")}>Review</button></div></>}{settingsTab==="Notifications"&&<>{["New followers","Likes and comments","Messages","Community activity"].map(x=><div className="setting-row" key={x}><div><strong>{x}</strong><span>Receive updates about {x.toLowerCase()}.</span></div><button className="toggle toggle-on" onClick={e=>e.currentTarget.classList.toggle("toggle-on")}><i/></button></div>)}</>}{settingsTab==="Appearance"&&<><div className="setting-row"><div><strong>Dark appearance</strong><span>Switch this preview to a darker interface.</span></div><button className={"toggle "+(darkMode?"toggle-on":"")} onClick={()=>{setDarkMode(!darkMode);document.body.classList.toggle("dark-preview",!darkMode)}}><i/></button></div><div className="setting-row"><div><strong>Theme colour</strong><span>Gist Up purple is the current brand theme.</span></div><span className="theme-dot"/></div></>}{settingsTab==="Blocked accounts"&&<>{blocked.length?blocked.map(p=><div className="setting-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div><strong>{p.name}</strong><span>{p.handle}</span></div><button className="outline-button compact" onClick={()=>setBlocked(old=>old.filter(x=>x.handle!==p.handle))}>Unblock</button></div>):<div className="empty-state-box"><Ban size={25}/><strong>No blocked accounts</strong><p>People you block will be listed here.</p></div>}<h3 className="subheading">Preview people</h3>{people.filter(p=>!blocked.some(b=>b.handle===p.handle)).map(p=><div className="setting-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div><strong>{p.name}</strong><span>{p.handle}</span></div><button className="outline-button compact" onClick={()=>{setBlocked(old=>[...old,p]);notify(p.name+" blocked in this preview.");}}>Block</button></div>)}</>}{settingsTab==="Data & account"&&<><div className="setting-row"><div><strong>Download your information</strong><span>Account export is not available in this preview.</span></div><button className="text-button" onClick={()=>notify("Data export needs backend support.")}>Request</button></div><div className="setting-row"><div><strong>Deactivate account</strong><span>Temporarily pause your account.</span></div><button className="text-button" onClick={()=>notify("Account actions require a real account.")}>Review</button></div><div className="setting-row danger-row"><div><strong>Delete account</strong><span>Permanent account deletion is not connected.</span></div><button className="text-button" onClick={()=>notify("No account was deleted. Account controls are preview-only.")}><Trash2 size={15}/> Review</button></div></>}</section></div>;
  }
  function AuthPage() {
    return <div className="auth-shell"><div className="auth-left"><button className="brand auth-brand" onClick={()=>setAuthMode("welcome")}><span className="brand-mark">g</span><span>gist<span className="brand-up">up</span></span></button><div className="auth-promo"><span className="welcome-pill"><Sparkles size={13}/> YOUR PEOPLE. YOUR STORIES.</span><h1>A little more connection.<br/><span>A lot more you.</span></h1><p>Share your story, discover new perspectives, and find the people who make your world feel bigger.</p><div className="auth-floating-card"><div className="mini-avatars"><i>M</i><i>D</i><i>A</i></div><strong>Real people. Shared moments.</strong><small>Your next favourite conversation is out there.</small></div></div><div className="auth-foot">Made for the stories that bring us together. · © 2026 Gist Up</div></div><div className="auth-right"><div className="auth-form-wrap">{authMode==="welcome"?<><div className="auth-mobile-logo"><span className="brand-mark">g</span> gist<span className="brand-up">up</span></div><span className="eyebrow">WELCOME TO GIST UP</span><h2>Your people are here.</h2><p>Join conversations, share what matters, and make your space your own.</p><button className="primary-button auth-main-btn" onClick={()=>setAuthMode("signup")}>Create your account <ArrowRight size={17}/></button><button className="google-button" onClick={()=>notify("Google sign-in is not connected in this preview.")}><span className="google-g">G</span> Continue with Google</button><div className="auth-separator"><span>or</span></div><button className="outline-button auth-main-btn" onClick={()=>setAuthMode("login")}>Log in</button><button className="text-button preview-entry" onClick={()=>setAuthMode("app")}>Explore the website preview <ArrowRight size={15}/></button><small>By continuing, you agree to our Terms and Privacy Policy.</small></>:<><button className="back-link" onClick={()=>setAuthMode("welcome")}>← Back</button><span className="eyebrow">{authMode==="signup"?"GET STARTED":"WELCOME BACK"}</span><h2>{authMode==="signup"?"Create your account":"Log in to Gist Up"}</h2><p>{authMode==="signup"?"A few details and you're on your way.":"Your people and conversations are waiting."}</p>{authMode==="signup"&&<label className="auth-label">Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label>}<label className="auth-label">Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="auth-label">Password<span className="password-input"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button onClick={()=>setShowPassword(!showPassword)} type="button" aria-label="Show password">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label><button className="primary-button auth-main-btn" onClick={submitAuth} disabled={authBusy}>{authBusy ? "Please wait…" : authMode==="signup" ? "Create account" : "Log in"} <ArrowRight size={16}/></button>{authError && <p className="auth-error" role="alert">{authError}</p>}<div className="auth-switch">{authMode==="signup"?"Already have an account?":"New to Gist Up?"} <button onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")}>{authMode==="signup"?"Log in":"Create an account"}</button></div><small>{isSupabaseConfigured ? "Your account is protected by Supabase authentication." : "Authentication is temporarily unavailable because the service is not configured."}</small></>}</div></div></div>;
  }
  if (authMode!=="app") return <>{AuthPage()}{notice&&<div className="toast" role="status">{notice}</div>}</>;
  const page = active==="Home"?<HomePage/>:active==="Explore"?<ExplorePage/>:active==="Communities"?<CommunitiesPage/>:active==="Messages"?<MessagesPage/>:active==="Notifications"?<NotificationsPage/>:active==="Saved"?<SavedPage/>:active==="Profile"?<ProfilePage/>:active==="Creator Studio"?<CreatorStudioPage/>:active==="AI Assistant"?<AssistantPage/>:active==="Ads Manager"?<AdsManagerPage/>:active==="Settings & Privacy"?<SettingsPage/>:<HomePage />;
  return <div className="app-shell">
    <header className="topbar"><button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X size={20}/>:<Menu size={20}/>}</button><button className="brand" onClick={()=>go("Home")}><span className="brand-mark">g</span><span>gist<span className="brand-up">up</span></span></button><label className="searchbox"><Search size={18}/><input aria-label="Search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")go("Explore")}} placeholder="Search people, topics, and communities"/><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={()=>go("Notifications")}><Bell size={20}/><i/></button><button className="top-profile" onClick={()=>go("Profile")}><Avatar initials={myInitials} size="small"/><span className="profile-name">{displayName}</span></button></div></header>
    {notice&&<div className="toast" role="status">{notice}</div>}
    <div className="layout"><aside className={"left-sidebar "+(mobileNav?"open":"")}><div className="sidebar-label">MENU</div>{navigation.map(({label,icon:Icon})=><button key={label} className={"nav-item "+(active===label?"selected":"")} onClick={()=>go(label)}><Icon size={19}/><span>{label}</span>{label==="Notifications"&&<b className="nav-count">3</b>}</button>)}<div className="sidebar-divider"/><div className="sidebar-label">YOUR SPACE</div>{spaces.map(({label,name,icon:Icon,desc})=><button key={name} title={desc} className={"nav-item "+(active===name?"selected":"")} onClick={()=>go(name)}><Icon size={19}/><span>{name}</span></button>)}<button className={"nav-item "+(active==="Profile"?"selected":"")} onClick={()=>go("Profile")}><UserRound size={19}/><span>My profile</span></button><div className="sidebar-card"><div className="sidebar-card-icon"><Sparkles size={18}/></div><strong>Make your space yours</strong><p>Find your people and join conversations that matter to you.</p><button onClick={()=>go("Explore")}>Explore Gist Up <ArrowRight size={14}/></button></div><div className="sidebar-footer">About · Guidelines · Privacy<p>© 2026 Gist Up</p><button className="text-button" onClick={signOut}><LogOut size={13}/> Sign out</button></div></aside>
    <main className="feed-column"><HeaderTitle/>{page}</main>
    <aside className="right-sidebar"><section className="right-card profile-card"><div className="profile-cover"/><div className="profile-card-body"><Avatar initials={myInitials} size="large"/><strong>{displayName}</strong><span>{handle}</span><p>{profileBio}</p><div className="profile-metrics"><div><b>{following.length}</b><span>Following</span></div><div><b>0</b><span>Followers</span></div><div><b>{posts.filter(p=>p.handle===handle).length}</b><span>Posts</span></div></div><button className="outline-button" onClick={()=>go("Profile")}>View profile</button></div></section><section className="right-card trends-card"><div className="right-card-heading"><h3><TrendingUp size={17}/> What's happening</h3><button onClick={()=>go("Explore")}>See all</button></div>{[["#CreativeCommunity","2.4k posts","Creators"],["#MondayMotivation","1.8k posts","Lifestyle"],["#DesignTalk","956 posts","Technology"]].map(([tag,count,category])=><button className="trend-row" key={tag} onClick={()=>{setQuery(tag);go("Explore")}}><span>{category} · Trending</span><strong>{tag}</strong><small>{count}</small></button>)}</section><section className="right-card suggestions-card"><div className="right-card-heading"><h3>People to know</h3><button onClick={()=>go("Explore")}>See all</button></div>{people.slice(0,3).map(p=><div className="suggestion-row" key={p.handle}><Avatar initials={p.initials} tone={p.tone}/><div className="suggestion-info"><strong>{p.name}</strong><span>{p.handle}</span></div><button className="follow-button" onClick={()=>toggleFollow(p)}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}</section><footer className="right-footer">About · Help · Community Guidelines<br/>Privacy · Terms · Cookies<br/><span>© 2026 Gist Up</span></footer></aside></div>
    {composerOpen&&<div className="modal-backdrop" onClick={()=>setComposerOpen(false)}><section className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2 id="composer-title">Create a post</h2><button className="icon-button" aria-label="Close" onClick={()=>setComposerOpen(false)}><X size={20}/></button></div><div className="modal-user"><Avatar initials={myInitials} size="medium"/><div><strong>{displayName}</strong><span>Sharing with everyone</span></div></div><textarea autoFocus value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's on your mind?" maxLength={5000}/><div className="modal-bottom"><span>{postText.length}/5000</span><button className="primary-button" disabled={!postText.trim()} onClick={publish}>Publish post <ArrowRight size={16}/></button></div><p className="preview-note">Preview only: posts are stored in this page session, not on a server.</p></section></div>}
    {commentPost!==null&&<div className="modal-backdrop" onClick={()=>setCommentPost(null)}><section className="composer-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Comments</h2><button className="icon-button" onClick={()=>setCommentPost(null)}><X size={20}/></button></div><p className="muted">Join the conversation on this post.</p><div className="comment-input"><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Write a comment…"/><button className="primary-button" onClick={()=>{if(commentText.trim())notify("Comment preview added locally.");setCommentText("");setCommentPost(null)}} disabled={!commentText.trim()}><Send size={15}/></button></div><p className="preview-note">Comments are not sent to real accounts in this preview.</p></section></div>}
    {editProfile&&<div className="modal-backdrop" onClick={()=>setEditProfile(false)}><section className="composer-modal edit-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2>Edit profile</h2><button className="icon-button" onClick={()=>setEditProfile(false)}><X size={20}/></button></div><label className="auth-label">Display name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={50}/></label><label className="auth-label">Username<input value={handle} onChange={e=>setHandle(e.target.value.startsWith("@")?e.target.value:"@"+e.target.value)} maxLength={30}/></label><label className="auth-label">Bio<textarea value={profileBio} onChange={e=>setProfileBio(e.target.value)} maxLength={160}/></label><button className="primary-button auth-main-btn" onClick={()=>{setEditProfile(false);notify("Profile updated in this preview.")}}><Check size={16}/> Save changes</button><p className="preview-note">Profile edits are local to this preview.</p></section></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);
