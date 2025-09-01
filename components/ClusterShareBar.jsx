"use client";
import { useState } from "react";

export default function ClusterShareBar({ url, title, onBookmark, onHide }) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const encUrl = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title || "");

  const embedCode = `<iframe src="${url}" title="${title || "DuckWire story"}" width="600" height="400" style="border:0;" loading="lazy"></iframe>`;

  async function copy(text, which) {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "link") {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else if (which === "embed") {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 1500);
      }
    } catch {}
  }

  return (
    <div className="flex gap-[5px] items-end ml-auto tablet:w-auto justify-end tablet:justify-start">
      <div className="md:flex hidden md:gap-[5px] items-end">
        {/* Facebook */}
        <a id="article-share-facebook" aria-label="facebook" className="react-share__ShareButton" href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "transparent", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}>
          <svg className="dark:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10.5" fill="#262626"></circle>
            <path d="M15.9103 15.2112L16.3767 12.2476H13.4589V10.3252C13.4589 9.51428 13.8657 8.7233 15.1726 8.7233H16.5V6.20024C16.5 6.20024 15.2959 6 14.1452 6C11.7411 6 10.1712 7.4197 10.1712 9.98883V12.2476H7.5V15.2112H10.1712V22.3759C10.7075 22.458 11.2562 22.5 11.8151 22.5C12.374 22.5 12.9226 22.458 13.4589 22.3759V15.2112H15.9103Z" fill="#EEEFE9"></path>
          </svg>
          <svg className="hidden dark:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10.5" fill="#EEEFE9"></circle>
            <path d="M15.9103 15.2112L16.3767 12.2476H13.4589V10.3252C13.4589 9.51428 13.8657 8.7233 15.1726 8.7233H16.5V6.20024C16.5 6.20024 15.2959 6 14.1452 6C11.7411 6 10.1712 7.4197 10.1712 9.98883V12.2476H7.5V15.2112H10.1712V22.3759C10.7075 22.458 11.2562 22.5 11.8151 22.5C12.374 22.5 12.9226 22.458 13.4589 22.3759V15.2112H15.9103Z" fill="#262626"></path>
          </svg>
        </a>
        {/* X/Twitter */}
        <a id="article-share-twitter" aria-label="twitter" className="react-share__ShareButton" href={`https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "transparent", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}>
          <svg className="dark:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 12C22.5 17.796 17.8012 22.5 12 22.5C6.19875 22.5 1.5 17.796 1.5 12C1.5 6.19875 6.19875 1.5 12 1.5C17.8012 1.5 22.5 6.19875 22.5 12Z" fill="#262626"></path>
            <path xmlns="http://www.w3.org/2000/svg" transform="translate(6.5,5.5) scale(0.75, 0.75)" d="M 9.523438 6.769531 L 15.480469 0 L 14.066406 0 L 8.894531 5.878906 L 4.765625 0 L 0 0 L 6.246094 8.890625 L 0 15.992188 L 1.410156 15.992188 L 6.875 9.78125 L 11.234375 15.992188 L 16 15.992188 Z M 7.589844 8.96875 L 6.957031 8.082031 L 1.921875 1.039062 L 4.089844 1.039062 L 8.152344 6.722656 L 8.785156 7.609375 L 14.066406 15 L 11.898438 15 Z M 7.589844 8.96875 " fill="#EEEFE9"></path>
          </svg>
          <svg className="hidden dark:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 12C22.5 17.796 17.8012 22.5 12 22.5C6.19875 22.5 1.5 17.796 1.5 12C1.5 6.19875 6.19875 1.5 12 1.5C17.8012 1.5 22.5 6.19875 22.5 12Z" fill="#EEEFE9"></path>
            <path xmlns="http://www.w3.org/2000/svg" transform="translate(6.5,5.5) scale(0.75, 0.75)" d="M 9.523438 6.769531 L 15.480469 0 L 14.066406 0 L 8.894531 5.878906 L 4.765625 0 L 0 0 L 6.246094 8.890625 L 0 15.992188 L 1.410156 15.992188 L 6.875 9.78125 L 11.234375 15.992188 L 16 15.992188 Z M 7.589844 8.96875 L 6.957031 8.082031 L 1.921875 1.039062 L 4.089844 1.039062 L 8.152344 6.722656 L 8.785156 7.609375 L 14.066406 15 L 11.898438 15 Z M 7.589844 8.96875 " fill="#262626"></path>
          </svg>
        </a>
        {/* LinkedIn */}
        <a id="article-share-linkedin" aria-label="linkedin" className="react-share__ShareButton" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "transparent", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}>
          <svg className="dark:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="10.5" fill="#262626"></rect>
            <path d="M9.46392 7.26911C9.46392 7.97002 8.85639 8.53822 8.10696 8.53822C7.35753 8.53822 6.75 7.97002 6.75 7.26911C6.75 6.5682 7.35753 6 8.10696 6C8.85639 6 9.46392 6.5682 9.46392 7.26911Z" fill="#EEEFE9"></path>
            <path d="M6.93557 9.47107H9.25515V16.5H6.93557V9.47107Z" fill="#EEEFE9"></path>
            <path d="M12.9897 9.47107H10.6701V16.5H12.9897C12.9897 16.5 12.9897 14.2872 12.9897 12.9036C12.9897 12.0732 13.2732 11.2392 14.4046 11.2392C15.6833 11.2392 15.6756 12.3259 15.6696 13.1678C15.6618 14.2683 15.6804 15.3914 15.6804 16.5H18V12.7903C17.9804 10.4215 17.3631 9.33006 15.3325 9.33006C14.1265 9.33006 13.379 9.87754 12.9897 10.3729V9.47107Z" fill="#EEEFE9"></path>
          </svg>
          <svg className="hidden dark:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="10.5" fill="#EEEFE9"></rect>
            <path d="M9.46392 7.26911C9.46392 7.97002 8.85639 8.53822 8.10696 8.53822C7.35753 8.53822 6.75 7.97002 6.75 7.26911C6.75 6.5682 7.35753 6 8.10696 6C8.85639 6 9.46392 6.5682 9.46392 7.26911Z" fill="#262626"></path>
            <path d="M6.93557 9.47107H9.25515V16.5H6.93557V9.47107Z" fill="#262626"></path>
            <path d="M12.9897 9.47107H10.6701V16.5H12.9897C12.9897 16.5 12.9897 14.2872 12.9897 12.9036C12.9897 12.0732 13.2732 11.2392 14.4046 11.2392C15.6833 11.2392 15.6756 12.3259 15.6696 13.1678C15.6618 14.2683 15.6804 15.3914 15.6804 16.5H18V12.7903C17.9804 10.4215 17.3631 9.33006 15.3325 9.33006C14.1265 9.33006 13.379 9.87754 12.9897 10.3729V9.47107Z" fill="#262626"></path>
          </svg>
        </a>
        {/* Reddit */}
        <a id="article-share-reddit" aria-label="reddit" className="react-share__ShareButton" href={`https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "transparent", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}>
          <svg className="dark:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.5C6.20859 1.5 1.5 6.20859 1.5 12C1.5 17.7914 6.20859 22.5 12 22.5C17.7914 22.5 22.5 17.7914 22.5 12C22.5 6.20859 17.7914 1.5 12 1.5Z" fill="#262626"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0144 6.68213C15.0049 6.74238 15 6.8042 15 6.86719C15 7.50324 15.5037 8.01886 16.125 8.01886C16.7463 8.01886 17.25 7.50324 17.25 6.86719C17.25 6.23114 16.7463 5.71552 16.125 5.71552C15.8481 5.71552 15.5946 5.8179 15.3987 5.98769L12.4771 5.25L11.4212 9.57382C10.0165 9.66844 8.75323 10.1039 7.80023 10.7614C7.52964 10.4897 7.15893 10.3222 6.75 10.3222C5.92157 10.3222 5.25 11.0097 5.25 11.8578C5.25 12.4479 5.57524 12.9604 6.05225 13.2174C6.01779 13.4006 6 13.5874 6 13.7772C6 16.1094 8.68629 18 12 18C15.3137 18 18 16.1094 18 13.7772C18 13.5874 17.9822 13.4006 17.9477 13.2174C18.4248 12.9604 18.75 12.4479 18.75 11.8578C18.75 11.0097 18.0784 10.3222 17.25 10.3222C16.8411 10.3222 16.4704 10.4897 16.1998 10.7614C15.1615 10.0451 13.7549 9.59229 12.1985 9.55669L13.0229 6.18107L15.0144 6.68213ZM9.375 14.1611C9.99632 14.1611 10.5 13.6455 10.5 13.0094C10.5 12.3734 9.99632 11.8578 9.375 11.8578C8.75368 11.8578 8.25 12.3734 8.25 13.0094C8.25 13.6455 8.75368 14.1611 9.375 14.1611ZM14.625 14.1611C15.2463 14.1611 15.75 13.6455 15.75 13.0094C15.75 12.3734 15.2463 11.8578 14.625 11.8578C14.0037 11.8578 13.5 12.3734 13.5 13.0094C13.5 13.6455 14.0037 14.1611 14.625 14.1611ZM9.58301 15.3772C9.41069 15.2596 9.17786 15.3073 9.06298 15.4837C8.9481 15.6601 8.99466 15.8985 9.16699 16.0161C9.98305 16.573 10.9915 16.8515 12 16.8515C13.0085 16.8515 14.0169 16.573 14.833 16.0161C15.0053 15.8985 15.0519 15.6601 14.937 15.4837C14.8221 15.3073 14.5893 15.2596 14.417 15.3772C13.7269 15.8482 12.8634 16.0837 12 16.0837C11.4879 16.0837 10.9759 16.0009 10.5 15.8352C10.1734 15.7216 9.86386 15.5689 9.58301 15.3772Z" fill="#EEEFE9"></path>
          </svg>
          <svg className="hidden dark:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.5C6.20859 1.5 1.5 6.20859 1.5 12C1.5 17.7914 6.20859 22.5 12 22.5C17.7914 22.5 22.5 17.7914 22.5 12C22.5 6.20859 17.7914 1.5 12 1.5Z" fill="#EEEFE9"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0144 6.68213C15.0049 6.74238 15 6.8042 15 6.86719C15 7.50324 15.5037 8.01886 16.125 8.01886C16.7463 8.01886 17.25 7.50324 17.25 6.86719C17.25 6.23114 16.7463 5.71552 16.125 5.71552C15.8481 5.71552 15.5946 5.8179 15.3987 5.98769L12.4771 5.25L11.4212 9.57382C10.0165 9.66844 8.75323 10.1039 7.80023 10.7614C7.52964 10.4897 7.15893 10.3222 6.75 10.3222C5.92157 10.3222 5.25 11.0097 5.25 11.8578C5.25 12.4479 5.57524 12.9604 6.05225 13.2174C6.01779 13.4006 6 13.5874 6 13.7772C6 16.1094 8.68629 18 12 18C15.3137 18 18 16.1094 18 13.7772C18 13.5874 17.9822 13.4006 17.9477 13.2174C18.4248 12.9604 18.75 12.4479 18.75 11.8578C18.75 11.0097 18.0784 10.3222 17.25 10.3222C16.8411 10.3222 16.4704 10.4897 16.1998 10.7614C15.1615 10.0451 13.7549 9.59229 12.1985 9.55669L13.0229 6.18107L15.0144 6.68213ZM9.375 14.1611C9.99632 14.1611 10.5 13.6455 10.5 13.0094C10.5 12.3734 9.99632 11.8578 9.375 11.8578C8.75368 11.8578 8.25 12.3734 8.25 13.0094C8.25 13.6455 8.75368 14.1611 9.375 14.1611ZM14.625 14.1611C15.2463 14.1611 15.75 13.6455 15.75 13.0094C15.75 12.3734 15.2463 11.8578 14.625 11.8578C14.0037 11.8578 13.5 12.3734 13.5 13.0094C13.5 13.6455 14.0037 14.1611 14.625 14.1611ZM9.58301 15.3772C9.41069 15.2596 9.17786 15.3073 9.06298 15.4837C8.9481 15.6601 8.99466 15.8985 9.16699 16.0161C9.98305 16.573 10.9915 16.8515 12 16.8515C13.0085 16.8515 14.0169 16.573 14.833 16.0161C15.0053 15.8985 15.0519 15.6601 14.937 15.4837C14.8221 15.3073 14.5893 15.2596 14.417 15.3772C13.7269 15.8482 12.8634 16.0837 12 16.0837C11.4879 16.0837 10.9759 16.0009 10.5 15.8352C10.1734 15.7216 9.86386 15.5689 9.58301 15.3772Z" fill="#262626"></path>
          </svg>
        </a>
        {/* Email */}
        <a id="article-share-email" aria-label="email" className="react-share__ShareButton" href={`mailto:?subject=${encTitle}&body=${encUrl}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "transparent", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}>
          <svg className="dark:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="10.5" fill="#262626"></rect>
            <path d="M16.8001 7.19995H7.20015C6.75832 7.19995 6.40015 7.55812 6.40015 7.99995V16C6.40015 16.4418 6.75832 16.8 7.20015 16.8H16.8001C17.242 16.8 17.6001 16.4418 17.6001 16V7.99995C17.6001 7.55812 17.242 7.19995 16.8001 7.19995Z" fill="#EEEFE9"></path>
            <path d="M6.40015 9.59995L12.0001 12.8L17.6001 9.59995M7.20015 7.19995H16.8001C17.242 7.19995 17.6001 7.55812 17.6001 7.99995V16C17.6001 16.4418 17.242 16.8 16.8001 16.8H7.20015C6.75832 16.8 6.40015 16.4418 6.40015 16V7.99995C6.40015 7.55812 6.75832 7.19995 7.20015 7.19995Z" stroke="#262626" strokeWidth="0.75"></path>
          </svg>
          <svg className="hidden dark:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="10.5" fill="#EEEFE9"></rect>
            <path d="M16.8001 7.19995H7.20015C6.75832 7.19995 6.40015 7.55812 6.40015 7.99995V16C6.40015 16.4418 6.75832 16.8 7.20015 16.8H16.8001C17.242 16.8 17.6001 16.4418 17.6001 16V7.99995C17.6001 7.55812 17.242 7.19995 16.8001 7.19995Z" fill="#262626"></path>
            <path d="M6.40015 9.59995L12.0001 12.8L17.6001 9.59995M7.20015 7.19995H16.8001C17.242 7.19995 17.6001 7.55812 17.6001 7.99995V16C17.6001 16.4418 17.242 16.8 16.8001 16.8H7.20015C6.75832 16.8 6.40015 16.4418 6.40015 16V7.99995C6.40015 7.55812 6.75832 7.19995 7.20015 7.19995Z" stroke="#EEEFE9" strokeWidth="0.75"></path>
          </svg>
        </a>
        {/* Embed (copy) */}
        <button id="article-share-embed" className="cursor-pointer" onClick={() => copy(embedCode, "embed")} aria-label="embed">
          <svg className="dark:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="10.5" fill="#262626"></rect>
            <path fill="#EEEFE9" d="M 7.5 7.5 L 8.5 8.5 L 5.5 12 L 8.5 15.5 L 7.5 16.5 L 4.08 12 L 7.5 7.5"></path>
            <path fill="#EEEFE9" d="M 12.5 7.5 h 1.25 L11.5 16.5 h -1.25 L 12.5 7.5 "></path>
            <path fill="#EEEFE9" d="M 15.5 8.5 L 16.5 7.5 L 20.08 12 L 16.5 16.5 L 15.5 15.5 L 18.5 12 L 15.5 8.5"></path>
          </svg>
          <svg className="hidden dark:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="10.5" fill="#EEEFE9"></rect>
            <path fill="#262626" d="M 7.5 7.5 L 8.5 8.5 L 5.5 12 L 8.5 15.5 L 7.5 16.5 L 4.08 12 L 7.5 7.5"></path>
            <path fill="#262626" d="M 12.5 7.5 h 1.25 L11.5 16.5 h -1.25 L 12.5 7.5 "></path>
            <path fill="#262626" d="M 15.5 8.5 L 16.5 7.5 L 20.08 12 L 16.5 16.5 L 15.5 15.5 L 18.5 12 L 15.5 8.5"></path>
          </svg>
        </button>

        {/* Divider */}
        <div className="border-r mx-[1.3rem] border-light-heavy"><div className="inline-block min-h-[1.13rem] w-[0.31rem]"></div></div>
      </div>

      {/* Link (copy), Bookmark, Hide */}
      <button id="headline-link" className="relative cursor-pointer" onClick={() => copy(url, "link")} aria-label="copy link">
        <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="link" className="svg-inline--fa fa-link fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ fontSize: 20 }}>
          <path fill="currentColor" d="M314.222 197.78c51.091 51.091 54.377 132.287 9.75 187.16-6.242 7.73-2.784 3.865-84.94 86.02-54.696 54.696-143.266 54.745-197.99 0-54.711-54.69-54.734-143.255 0-197.99 32.773-32.773 51.835-51.899 63.409-63.457 7.463-7.452 20.331-2.354 20.486 8.192a173.31 173.31 0 0 0 4.746 37.828c.966 4.029-.272 8.269-3.202 11.198L80.632 312.57c-32.755 32.775-32.887 85.892 0 118.8 32.775 32.755 85.892 32.887 118.8 0l75.19-75.2c32.718-32.725 32.777-86.013 0-118.79a83.722 83.722 0 0 0-22.814-16.229c-4.623-2.233-7.182-7.25-6.561-12.346 1.356-11.122 6.296-21.885 14.815-30.405l4.375-4.375c3.625-3.626 9.177-4.594 13.76-2.294 12.999 6.524 25.187 15.211 36.025 26.049zM470.958 41.04c-54.724-54.745-143.294-54.696-197.99 0-82.156 82.156-78.698 78.29-84.94 86.02-44.627 54.873-41.341 136.069 9.75 187.16 10.838 10.838 23.026 19.525 36.025 26.049 4.582 2.3 10.134 1.331 13.76-2.294l4.375-4.375c8.52-8.519 13.459-19.283 14.815-30.405.621-5.096-1.938-10.113-6.561-12.346a83.706 83.706 0 0 1-22.814-16.229c-32.777-32.777-32.718-86.065 0-118.79l75.19-75.2c32.908-32.887 86.025-32.755 118.8 0 32.887 32.908 32.755 86.025 0 118.8l-45.848 45.84c-2.93 2.929-4.168 7.169-3.202 11.198a173.31 173.31 0 0 1 4.746 37.828c.155 10.546 13.023 15.644 20.486 8.192 11.574-11.558 30.636-30.684 63.409-63.457 54.733-54.735 54.71-143.3-.001-197.991z"></path>
        </svg>
      </button>
      <button id="headline-save" className="relative cursor-pointer ml-[8px]" onClick={() => onBookmark?.()} aria-label="bookmark">
        <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="bookmark" className="svg-inline--fa fa-bookmark fa-w-12 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style={{ fontSize: 20 }}>
          <path fill="currentColor" d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm0 428.43l-144-84-144 84V54a6 6 0 0 1 6-6h276c3.314 0 6 2.683 6 5.996V428.43z"></path>
        </svg>
      </button>
      <button id="show-less-clicked" className="relative cursor-pointer ml-[8px]" onClick={() => onHide?.()} aria-label="hide">
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_3702_4616)">
            <path d="M9.00098 15.75C12.7289 15.75 15.751 12.7279 15.751 9C15.751 5.27208 12.7289 2.25 9.00098 2.25C5.27305 2.25 2.25098 5.27208 2.25098 9C2.25098 12.7279 5.27305 15.75 9.00098 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M13.7739 4.22717L4.22754 13.7728" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </g>
          <defs>
            <clipPath id="clip0_3702_4616"><rect width="18" height="18" fill="white"></rect></clipPath>
          </defs>
        </svg>
      </button>
    </div>
  );
}
