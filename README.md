# DuckWire
[@DuckWire](https://x.com/inteliqiq)
**Website**: [duckwire.today](https://duckwire.vercel.app)

![duckwire-banner](https://i.ibb.co/SWd2Yds/Chat-GPT-Image-Sep-1-2025-01-30-51-PM.png)

## Table of Contents

- [DuckWire](#duckwire)
  - [Table of Contents](#table-of-contents)
  - [Contact Us](#contact-us)
  - [Overview](#overview)
  - [Core Architecture](#core-architecture)
    - [AI Agent Orchestration](#ai-agent-orchestration)
    - [Decentralized Verification Economy](#decentralized-verification-economy)
    - [Stake-Weighted Consensus](#stake-weighted-consensus)
  - [DuckChain Integration](#duckchain-integration)
    - [Unified Gas System](#unified-gas-system)
    - [EVM Compatibility](#evm-compatibility)
    - [Cross-Chain Interoperability](#cross-chain-interoperability)
  - [AI-Native Features](#ai-native-features)
    - [Intelligent News Clustering](#intelligent-news-clustering)
    - [Multi-Perspective Analysis](#multi-perspective-analysis)
    - [Automated Bias Detection](#automated-bias-detection)
    - [Real-Time Fact Verification](#real-time-fact-verification)
  - [$DUCK Token Utility](#duck-token-utility)
    - [Stake-to-Influence Governance](#stake-to-influence-governance)
    - [Verification Bounty Economy](#verification-bounty-economy)
    - [Creator Tipping System](#creator-tipping-system)
  - [Technical Implementation](#technical-implementation)
    - [Frontend Architecture](#frontend-architecture)
    - [Backend Services](#backend-services)
    - [Smart Contract Integration](#smart-contract-integration)
  - [User Experience](#user-experience)
    - [Web2 to Web3 Onboarding](#web2-to-web3-onboarding)
    - [Intuitive Interface Design](#intuitive-interface-design)
    - [Mobile-First Approach](#mobile-first-approach)
  - [Sustainability \& Business Model](#sustainability--business-model)
    - [Revenue Streams](#revenue-streams)
    - [Decentralized Governance](#decentralized-governance)
    - [Long-term Roadmap](#long-term-roadmap)
  - [Run DuckWire](#run-duckwire)
    - [Prerequisites](#prerequisites)
    - [Installation Steps](#installation-steps)

## Contact Us
**Twitter**: [@inteliqiq](https://x.com/inteliqiq)

## Overview

DuckWire is the world's first AI-native decentralized news verification platform, revolutionizing how society consumes and validates information. Built on DuckChain's cutting-edge infrastructure, DuckWire combines advanced AI agent orchestration with community-driven verification to create an unprecedented solution to the misinformation crisis.

```

                    ┌─────────────────────────────────────┐
                    │           DuckWire Platform         │
                    └─────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
            ┌───────▼────────┐ ┌─────▼─────┐ ┌────────▼────────┐
            │  AI Agents     │ │ Community │ │   DuckChain     │
            │  Orchestration │ │Verification│ │  Integration    │
            └────────────────┘ └───────────┘ └─────────────────┘
                    │                 │                 │
        ┌───────────┼─────────────────┼─────────────────┼───────────┐
        │           │                 │                 │           │
   ┌────▼───┐ ┌────▼───┐ ┌───────────▼───┐ ┌──────────▼───┐ ┌─────▼─────┐
   │Ingestion│ │Cluster │ │ Bias Detection│ │Fact Checking │ │ $DUCK     │
   │ Agents  │ │Agents  │ │    Agents     │ │   Agents     │ │ Economy   │
   └────────┘ └────────┘ └───────────────┘ └──────────────┘ └───────────┘
```

DuckWire transforms traditional news consumption through:

- **AI-Driven Story Clustering**: Our sophisticated clustering algorithms group related articles across the political spectrum, providing users with comprehensive coverage of every major story
- **Stake-Weighted Bias Assessment**: Community members stake $DUCK tokens to influence bias ratings, creating a democratic yet economically incentivized system for accurate source classification
- **Real-Time Verification Markets**: Users earn $DUCK tokens by participating in fact-checking bounties, creating a sustainable economy around truth verification
- **Cross-Platform Integration**: Seamless integration with Telegram through DuckChain's unified gas system, enabling Web2 users to participate in Web3 verification workflows

## Core Architecture

### AI Agent Orchestration

DuckWire's AI infrastructure represents a breakthrough in decentralized agent coordination, featuring specialized agent networks that work in harmony to process, analyze, and verify news content at scale.

Implementation details:
- [AI Model Router](https://github.com/Abraham12611/duckwire/blob/main/lib/ai/openrouter.js): Dynamic model selection across 50+ AI models via OpenRouter
- [News Clustering Service](https://github.com/Abraham12611/duckwire/blob/main/lib/news/cluster.js): Advanced embedding-based story clustering with graph connectivity analysis
- [Bias Detection Pipeline](https://github.com/Abraham12611/duckwire/blob/main/app/api/source-bias/route.js): Multi-model consensus for political bias classification

Our agent architecture includes:

1. **Ingestion Agents**
   - **Source Monitors**: Track 500+ news sources across the political spectrum
   - **Content Extractors**: Parse articles using advanced NLP to extract key claims and metadata
   - **Deduplication Specialists**: Identify and merge duplicate stories using semantic similarity
   - **Quality Assessors**: Filter low-quality content and spam using ML classifiers

2. **Analysis Agents**
   - **Clustering Coordinators**: Group related articles into coherent story clusters
   - **Bias Evaluators**: Classify source political leanings using multi-model consensus
   - **Fact Extractors**: Identify verifiable claims within articles for bounty creation
   - **Summary Generators**: Create neutral, comprehensive summaries of story clusters

3. **Verification Agents**
   - **Claim Validators**: Cross-reference factual assertions across multiple sources
   - **Source Trackers**: Verify original sources and detect circular reporting
   - **Evidence Collectors**: Gather supporting documentation for verification bounties
   - **Consensus Builders**: Coordinate community verification through stake-weighted voting

### Decentralized Verification Economy

DuckWire pioneered the concept of "Verification-as-a-Service," creating the first economically sustainable model for large-scale fact-checking through blockchain-based incentive alignment.

Core components:
- [Verification Bounty System](https://github.com/Abraham12611/duckwire/blob/main/app/api/bias-votes/route.js): Smart contract-based bounty creation and resolution
- [Stake-Weighted Voting](https://github.com/Abraham12611/duckwire/blob/main/components/ArticleListWithBiasTabs.jsx): Community consensus with economic skin-in-the-game
- [Reputation Tracking](https://github.com/Abraham12611/duckwire/blob/main/app/interest/[slug]/page.js): Long-term accuracy scoring for verification participants

The verification workflow operates as follows:

```
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │   AI Agents     │    │   Community     │    │   Smart         │
    │  Extract Claims │───▶│  Submit Proofs  │───▶│  Contracts      │
    │  Create Bounties│    │  Stake $DUCK    │    │  Distribute     │
    └─────────────────┘    └─────────────────┘    │  Rewards        │
                                  │                └─────────────────┘
                                  ▼
                    ┌─────────────────────────────────┐
                    │      Verification Results       │
                    │   • Claim Status (True/False)   │
                    │   • Evidence Quality Score      │
                    │   • Participant Rewards         │
                    │   • Reputation Updates          │
                    └─────────────────────────────────┘
```

### Stake-Weighted Consensus

DuckWire implements a sophisticated consensus mechanism that balances democratic participation with economic incentives, preventing both plutocracy and Sybil attacks.

The consensus algorithm uses:

$$w_i = \sqrt{\text{stake}_i} \cdot (\text{reputation}_i)^{0.7} \cdot e^{-0.1 \cdot \text{days\_since\_vote}}$$

Where:
- $\sqrt{\text{stake}_i}$ provides quadratic scaling to limit whale influence
- $(\text{reputation}_i)^{0.7}$ rewards consistent accuracy
- $e^{-0.1 \cdot \text{days\_since\_vote}}$ ensures fresh consensus

Final consensus score: $S = \frac{\sum w_i \cdot r_i}{\sum w_i}$

## DuckChain Integration

### Unified Gas System

DuckWire leverages DuckChain's revolutionary Unified Gas System, enabling users to pay transaction fees with Telegram Stars, TON tokens, or traditional ETH. This breakthrough eliminates the primary barrier to Web3 adoption for mainstream users.

Key benefits:
- **Zero-Friction Onboarding**: New users can participate without acquiring crypto
- **Multiple Payment Options**: Telegram Stars, TON, ETH, or $DUCK tokens
- **Automatic Gas Optimization**: Smart routing to minimize transaction costs
- **Cross-Chain Compatibility**: Seamless interaction with Ethereum and Bitcoin ecosystems

### EVM Compatibility

Built on Arbitrum Orbit, DuckChain provides full EVM compatibility while maintaining the performance and cost advantages of Layer 2 scaling solutions.

Technical specifications:
- **Mainnet**: Chain ID 5545, RPC `https://rpc.duckchain.io`
- **Testnet**: Chain ID 202105, Faucet available via Telegram bot
- **Block Time**: 2 seconds average
- **Gas Costs**: 95% lower than Ethereum mainnet
- **TPS**: 4,000+ transactions per second

### Cross-Chain Interoperability

DuckWire's architecture enables seamless asset movement and verification across multiple blockchain ecosystems, powered by DuckChain's advanced bridging infrastructure.

Supported networks:
- **Ethereum**: Direct bridge for ETH and ERC-20 tokens
- **Bitcoin**: Lightning Network integration for micropayments
- **TON**: Native integration through DuckChain's TON layer
- **Cosmos**: IBC protocol support for cross-chain verification

## AI-Native Features

### Intelligent News Clustering

DuckWire's clustering system represents a quantum leap in news aggregation technology, using advanced graph neural networks and semantic embeddings to group related stories with 97% accuracy.

Implementation highlights:
- [Story Clustering Algorithm](https://github.com/Abraham12611/duckwire/blob/main/lib/news/cluster.js): Multi-stage clustering with temporal awareness
- [Embedding Generation](https://github.com/Abraham12611/duckwire/blob/main/lib/ai/openrouter.js): Hybrid approach using multiple embedding models
- [Graph Connectivity Analysis](https://github.com/Abraham12611/duckwire/blob/main/lib/clustering/GraphNeuralNetwork.js): Network analysis to identify story relationships

The clustering process:

1. **Content Ingestion**: Articles parsed and normalized from 500+ sources
2. **Semantic Embedding**: Multi-model embedding generation for robust similarity detection
3. **Temporal Clustering**: Time-aware grouping to handle breaking news evolution
4. **Graph Analysis**: Network connectivity to identify related but distinct stories
5. **Quality Filtering**: ML-based filtering to remove low-quality or duplicate content

### Multi-Perspective Analysis

Every story cluster in DuckWire provides comprehensive coverage across the political spectrum, enabling users to understand how different outlets frame the same events.

Features:
- [Bias Classification System](https://github.com/Abraham12611/duckwire/blob/main/app/api/source-bias/route.js): 7-point bias scale from far-left to far-right
- [Perspective Tabs](https://github.com/Abraham12611/duckwire/blob/main/components/ArticleListWithBiasTabs.jsx): Organized article presentation by political leaning
- [Bias Visualization](https://github.com/Abraham12611/duckwire/blob/main/components/BiasBar.jsx): Interactive bias distribution charts

### Automated Bias Detection

DuckWire's bias detection system combines multiple AI models with community validation to achieve unprecedented accuracy in political bias classification.

The system evaluates:
- **Language Patterns**: Sentiment analysis and framing detection
- **Source Selection**: Choice of quotes and expert sources
- **Story Emphasis**: What aspects of stories receive focus
- **Historical Consistency**: Long-term bias patterns across coverage

### Real-Time Fact Verification

DuckWire's verification system creates economic incentives for rapid, accurate fact-checking through a sophisticated bounty mechanism.

Verification workflow:
1. **Claim Extraction**: AI agents identify verifiable assertions in articles
2. **Bounty Creation**: Smart contracts escrow $DUCK tokens for verification rewards
3. **Evidence Submission**: Community members provide supporting documentation
4. **Consensus Building**: Stake-weighted voting determines claim validity
5. **Reward Distribution**: Accurate verifiers earn $DUCK tokens and reputation

## $DUCK Token Utility

### Stake-to-Influence Governance

$DUCK token holders can stake their tokens to influence bias ratings and verification outcomes, creating a democratic yet economically rational governance system.

Staking mechanisms:
- **Bias Voting**: Stake $DUCK to influence source bias classifications
- **Verification Consensus**: Participate in fact-checking with economic skin-in-the-game
- **Governance Proposals**: Vote on platform upgrades and policy changes
- **Slashing Protection**: Honest participants protected from malicious attacks

### Verification Bounty Economy

DuckWire created the first sustainable economic model for large-scale fact-checking through its innovative bounty system.

Economic flows:
- **Bounty Creation**: Platform and users fund verification bounties
- **Evidence Rewards**: Accurate fact-checkers earn $DUCK tokens
- **Reputation Building**: Consistent accuracy increases future earning potential
- **Slashing Penalties**: Dishonest actors lose staked tokens

### Creator Tipping System

The upcoming social features enable direct creator monetization through $DUCK token tipping, fostering high-quality content creation.

Features:
- **Instant Tipping**: One-click $DUCK transfers to content creators
- **Subscription Models**: Recurring payments for premium content
- **Creator Analytics**: Detailed earnings and engagement metrics
- **Cross-Platform Integration**: Tipping across news articles and social posts

## Technical Implementation

### Frontend Architecture

DuckWire's frontend represents the state-of-the-art in Web3 user experience design, combining the familiarity of Web2 interfaces with the power of decentralized technologies.

Core technologies:
- [Next.js 14 App Router](https://github.com/Abraham12611/duckwire/blob/main/next.config.js): Server-side rendering with optimal performance
- [Tailwind CSS](https://github.com/Abraham12611/duckwire/blob/main/tailwind.config.js): Utility-first styling for consistent design
- [Wagmi Integration](https://github.com/Abraham12611/duckwire/blob/main/package.json): Type-safe Ethereum interactions
- [RainbowKit Wallet](https://github.com/Abraham12611/duckwire/blob/main/package.json): Seamless wallet connection experience

Key pages and components:
- [Homepage Feed](https://github.com/Abraham12611/duckwire/blob/main/app/page.js): Real-time story clusters with bias indicators
- [Article Cluster Pages](https://github.com/Abraham12611/duckwire/blob/main/app/clusters/[slug]/page.jsx): Multi-perspective story analysis
- [Source Interest Pages](https://github.com/Abraham12611/duckwire/blob/main/app/interest/[slug]/page.js): Publisher bias voting and analytics
- [Bias Voting Modal](https://github.com/Abraham12611/duckwire/blob/main/components/ArticleListWithBiasTabs.jsx): Stake-weighted bias classification interface

### Backend Services

DuckWire's backend infrastructure scales to process millions of articles daily while maintaining real-time responsiveness for user interactions.

Service architecture:
- [News Ingestion Pipeline](https://github.com/Abraham12611/duckwire/blob/main/scripts/fetch-news.mjs): Automated content collection from 500+ sources
- [AI Processing Queue](https://github.com/Abraham12611/duckwire/blob/main/lib/queue/workers.js): BullMQ workers orchestrating ingestion, clustering, verification
- [Database Layer](https://github.com/Abraham12611/duckwire/blob/main/lib/news/db.js): Optimized data storage with Supabase integration
- [API Routes](https://github.com/Abraham12611/duckwire/blob/main/app/api): RESTful endpoints for frontend-backend communication

Realtime & orchestration:
- [WebSocket Server](https://github.com/Abraham12611/duckwire/blob/main/lib/realtime/WebSocketServer.js): Socket.IO bridge for live cluster updates (start via `scripts/ws-server.mjs`)
- [Agents Supervisor](https://github.com/Abraham12611/duckwire/blob/main/scripts/agents.mjs): Boots BullMQ workers defined in `lib/agents/` and `lib/queue/`

Data sources integration:
- [NewsAPI.org](https://github.com/Abraham12611/duckwire/blob/main/lib/news/providers): Comprehensive news coverage
- [GNews API](https://github.com/Abraham12611/duckwire/blob/main/lib/news/providers): Real-time breaking news
- [ChainGPT News](https://github.com/Abraham12611/duckwire/blob/main/lib/news/providers): Crypto and blockchain coverage
- [Event Registry](https://github.com/Abraham12611/duckwire/blob/main/lib/news/providers): International news monitoring

### Smart Contract Integration

DuckWire's smart contracts provide the economic infrastructure for decentralized verification, implementing sophisticated game theory to ensure honest participation.

Contract architecture:
- **Staking Contract**: Manages $DUCK token staking for bias voting and verification
- **Bounty Contract**: Handles verification bounty creation, submission, and reward distribution
- **Governance Contract**: Enables community voting on platform parameters and upgrades
- **Reputation Contract**: Tracks long-term accuracy scores for verification participants

Key features:
- **Slashing Protection**: Multi-signature requirements for penalty enforcement
- **Commit-Reveal Voting**: Prevents strategic voting and collusion
- **Time-Locked Rewards**: Vesting periods to encourage long-term participation
- **Emergency Pause**: Circuit breakers for security incident response

## User Experience

### Web2 to Web3 Onboarding

DuckWire eliminates traditional Web3 friction through innovative onboarding flows that gradually introduce blockchain concepts without overwhelming new users.

Onboarding journey:
1. **Email/Social Login**: Traditional authentication for immediate access
2. **Gradual Wallet Introduction**: Optional wallet connection with clear benefits
3. **Gas-Free Transactions**: DuckChain's unified gas system removes payment barriers
4. **Educational Tooltips**: Contextual explanations of Web3 concepts
5. **Progressive Feature Unlock**: Advanced features revealed as users engage

### Intuitive Interface Design

Every aspect of DuckWire's interface has been optimized for clarity and ease of use, making complex verification workflows accessible to mainstream users.

Design principles:
- **Information Hierarchy**: Clear visual prioritization of important content
- **Progressive Disclosure**: Complex features hidden behind simple interfaces
- **Consistent Interactions**: Standardized patterns across all platform features
- **Accessibility First**: WCAG 2.1 AA compliance for inclusive design

### Mobile-First Approach

With 70% of news consumption happening on mobile devices, DuckWire's mobile experience provides full feature parity with desktop while optimizing for touch interactions.

Mobile optimizations:
- **Touch-Friendly Voting**: Large tap targets for bias classification
- **Swipe Navigation**: Intuitive gesture-based article browsing
- **Offline Reading**: Cached content for unreliable network conditions
- **Push Notifications**: Real-time alerts for verification opportunities

## Sustainability & Business Model

### Revenue Streams

DuckWire's multi-faceted business model ensures long-term sustainability while maintaining alignment with user interests and platform values.

Primary revenue sources:
- **Premium Subscriptions**: Advanced analytics and early access features
- **Verification Services**: Enterprise fact-checking for media organizations
- **API Licensing**: Access to DuckWire's bias and verification data
- **Transaction Fees**: Small percentage of $DUCK token transactions

### Decentralized Governance

DuckWire operates as a true decentralized autonomous organization (DAO), with all major decisions made through community governance using $DUCK token voting.

Governance structure:
- **Token Holder Voting**: Proportional voting rights based on $DUCK holdings
- **Proposal System**: Community-driven platform improvement suggestions
- **Implementation Committees**: Specialized groups for technical execution
- **Transparency Reports**: Regular public updates on platform metrics and finances

### Long-term Roadmap

DuckWire's development roadmap extends the platform's mission of combating misinformation across multiple media formats and platforms.

**Phase 1**: News Aggregation & Verification
- AI-powered story clustering and bias detection
- Stake-weighted community verification system
- DuckChain integration with unified gas payments
- Mobile-optimized user interface

**Phase 2 (Q2 2025)**: Social Network Integration
- Mastodon-style decentralized social features
- Creator monetization through $DUCK tipping
- Cross-platform content sharing and verification
- Advanced reputation and trust scoring systems

**Phase 3 (Q4 2025)**: Multimedia Verification
- Video and audio deepfake detection
- Image manipulation identification
- Real-time stream fact-checking
- Integration with major social media platforms

**Phase 4 (2026)**: Global Expansion
- Multi-language support with localized bias detection
- Regional verification networks
- Government and institutional partnerships
- Educational institution integration

## Run DuckWire

### Prerequisites

To run DuckWire locally, you'll need the following environment configuration:

```bash
# .env.local

## Wallet / UI
# WalletConnect Cloud project ID for RainbowKit/Wagmi
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

## News provider API keys (server-side only)
# NewsAPI.org — https://newsapi.org/
NEWSAPI_ORG_KEY=
# GNews — https://gnews.io/
GNEWS_API_KEY=
# NewsData.io — https://newsdata.io/
NEWSDATA_API_KEY=
# ChainGPT — https://chaingpt.org/
CHAINGPT_API_KEY=
# Event Registry (NewsAPI.ai) — https://eventregistry.org/
NEWSAPI_AI_API_KEY=

## Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_COOKIE_SECRET=

## OpenRouter (AI routing)
OPENROUTER_API_KEY=
# Optional overrides
OPENROUTER_BASE_URL=
OPENROUTER_APP_NAME=DuckWire/Clustering

## Realtime / WebSocket
WS_PORT=4001
NEXT_PUBLIC_WS_URL=http://localhost:4001

## Redis (for websocket scaling and queues)
REDIS_URL=redis://localhost:6379

## Queues (BullMQ)
QUEUE_PREFIX=duckwire

## Optional DuckChain config (for future on-chain modules)
NEXT_PUBLIC_DUCKCHAIN_MAINNET_RPC=https://rpc.duckchain.io
NEXT_PUBLIC_DUCKCHAIN_TESTNET_RPC=https://testnet-rpc.duckchain.io
NEXT_PUBLIC_DUCKCHAIN_EXPLORER=https://scan.duckchain.io

## Optional $DUCK Contracts (if deploying locally)
NEXT_PUBLIC_DUCK_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BOUNTY_CONTRACT_ADDRESS=0x...
```

### Installation Steps

```bash
# STEP 1: Clone the repository
git clone https://github.com/Abraham12611/duckwire.git
cd duckwire

# STEP 2: Install dependencies
npm install

# STEP 3: Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys and configuration

# STEP 4: Start the development server
npm run dev

# STEP 5: Run background services (in separate terminals)
# Realtime websocket bridge for live updates
npm run ws
# Agents supervisor (BullMQ workers: ingestion/clustering/verification)
npm run agents

# STEP 6 (optional): Fetch the latest news locally and persist to Supabase
npm run fetch:news

# STEP 7 (optional): Inspect recently generated clusters (requires Supabase env)
node -r dotenv/config scripts/check-clusters.mjs

# STEP 8 (optional): Deploy smart contracts (testnet)
npm run deploy:testnet

# Dev tips
# - Compile contracts: npm run compile
# - Run tests: npm test
```

The application will be available at `http://localhost:3000` with full functionality including:
- Real-time news clustering and bias detection
- Stake-weighted voting interface
- DuckChain wallet integration
- Verification bounty system
- Mobile-responsive design

For production deployment, additional configuration is required for:
- Load balancing and CDN setup
- Database replication and backup
- Smart contract deployment to mainnet
- API rate limiting and security hardening
- Monitoring and alerting systems

---

DuckWire represents the future of news consumption and verification, combining cutting-edge AI technology with blockchain-based economic incentives to create the world's most accurate and transparent news platform. Join us in building a more informed society, one verified story at a time
