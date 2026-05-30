// LOCKED SOURCE OF TRUTH — never modify without updating MASTER_PROMPT.md

export const BASE_RESUME = `
Personal:
- Name: Pranav Koduru
- Phone: 571-663-9895
- Email: pranavkoduruc@gmail.com
- Location: Sunnyvale, CA
- LinkedIn: https://www.linkedin.com/in/pranav-koduru/
- GitHub: https://github.com/Pranavk098

Employer Context (LOCKED — do not describe or qualify in resume output):
- ATAI Labs is a privately held, venture-funded computer vision startup. Treat it as a recognized employer. Never add hedging language or company descriptions about ATAI Labs.

Education (output MS only — do not include undergraduate):
- George Mason University | MS Computer Science | 2024–2025 | GPA: 3.6/4.0
- Relevant Coursework: Data Mining, Machine Learning, Artificial Intelligence, Analysis of Algorithms

Certifications:
- Microsoft Azure AI Fundamentals (AI-900)
- CodePath: Foundations of AI Engineering (Honors)
- Google Cloud Developer Certification
- NVIDIA AI for All: Generative AI Practices
- Activeloop: LangChain and Vector Databases in Production
- Activeloop: RAG with LangChain and LlamaIndex

Skills (base):
- ML/Deep Learning: PyTorch, TensorFlow, Scikit-Learn, XGBoost, LightGBM, Random Forests, Logistic Regression, CNNs, ResNet, DeepLabV3+, LLaVA, PEFT/LoRA/QLoRA, Quantization, TensorRT, Albumentations, OpenCV, Hugging Face
- LLMs and Generative AI: OpenAI API, Anthropic API, LangChain, LlamaIndex, Qdrant, Pinecone, RAG Pipelines, Multi-Agent Systems, Prompt Engineering, Embedding Models, Fine-Tuning, Retrieval Augmented Generation
- MLOps and Infrastructure: Docker, FastAPI, AWS, GCP, Microsoft Azure, MLflow, Weights & Biases, CI/CD Pipelines, Feature Stores, Model Serving, Experiment Tracking, Git

Experience:

[ATAI Labs — ML Engineer | May 2022 – Dec 2023 | Hyderabad, India]
- Synthetic Data Generation: Built synthetic data pipeline in Blender using 3D scene meshes → boosted downstream model accuracy by 14%, cut annotation hours by 20%, generated 50,000 edge-case frames.
- Anomaly Detection: Designed CNN-based anomaly classifier for live surveillance feeds → reduced manual review workload by 70%, cut mean time-to-alert from minutes to 15 seconds using ResNet trained on 5,000 labelled frames.
- Inference Optimization: Optimized DeepLabV3+ segmentation pipeline via TensorRT with layer fusion and dynamic batch scheduling → reduced inference latency from 8s to 1.5s, achieving 60 FPS on GPU production cluster.
- Pipeline Parallelization: Refactored data ingestion across 5-person team → increased throughput by 38.5%, migrated sequential I/O to async multiprocessing with Python Asyncio, introduced validation checkpoints.
- Model Monitoring: Implemented continuous model monitoring for distribution drift → maintained stable performance within 3–5% variance across mIoU, accuracy, and F1 in dynamic production environment.

[ATAI Labs — ML Intern | Aug 2021 – May 2022 | Hyderabad, India]
- Segmentation Training: Trained pixel-level segmentation models for warehouse occupancy detection → achieved 89.2% accuracy on 8-class held-out test set of 24,000 images using InceptionNet with custom class-weighted loss.
- Dataset Curation: Built and curated 60,000+ image dataset → achieved 95% inter-annotator agreement, reduced label noise by 15% via multi-stage review pipeline with automated outlier flagging via Scikit-learn.
- Augmentation Pipeline: Designed comprehensive image augmentation pipeline using Albumentations and OpenCV → contributed to 5–10% validation performance increase under varied lighting, occlusion, and viewpoint conditions.
- Experiment Tracking: Established reproducible experiment tracking workflows with W&B → reduced experiment duplication by ~30%, enabled systematic comparison of model checkpoints and hyperparameters.

Projects:

[Vision-Language Model Defect Detection | PyTorch, LLaVA, QLoRA, Hugging Face, FastAPI, Docker, W&B]
- Fine-tuned LLaVA-1.5-7B with QLoRA for manufacturing defect classification across 15 categories → achieved 91.6% accuracy, 83% recall on 5,000-sample test set, GPU memory under 12 GB via 4-bit quantization with PEFT LoRA adapters (r=8, alpha=16).
- Designed greedy-decoding inference pipeline using HuggingFace AutoProcessor → processed each image in <3 seconds with <32 tokens per prediction, containerized via Docker with FastAPI serving layer.
- Packaged full training lifecycle as reproducible MLOps pipeline → one-command reproducibility and experiment comparison via W&B, all hyperparameters externalized to YAML config.

[Personalized Learning Roadmap Platform | GPT-4, LangChain, Qdrant, React, FastAPI, Vercel, Docker]
- Architected full-stack RAG system with GPT-4 → serving personalized learning roadmaps in 3–8s end-to-end at <100ms vector retrieval, chunking 6,000 curriculum documents with all-MiniLM-L6-v2 embeddings and MMR re-ranking.
- Designed dynamic knowledge graph of learning paths using React Flow → enabled prerequisite relationship exploration and skill dependency navigation.
- Deployed production system: React on Vercel, containerized FastAPI + Qdrant backend, real-time resource enrichment via DuckDuckGo API.

[AI-Powered Personal Finance Platform | Claude API, OpenAI API, LangChain, FastAPI, PostgreSQL, Docker]
- Built dual-provider LLM microservice routing across Claude and OpenAI over 10+ task types → dynamically selects models by task complexity, cutting estimated inference cost by 60% vs single-provider approach.
- Designed 3-layer memory system (structured key facts + delta-compressed narrative + 5-message recency buffer) → maintained conversation accuracy at constant token cost regardless of session length.
- Implemented 6-action agentic layer → Claude outputs validated structured JSON payloads driving SQL execution, UI rendering, and user management from single natural language input, reducing avg prompt size by ~40%.

[Supervised Learning & Predictive Modeling Pipeline | Scikit-Learn, XGBoost, LightGBM, Python, Pandas, MLflow]
- Built end-to-end supervised learning pipeline benchmarking LR, RF, GBM, and XGBoost on 500,000+ record datasets → achieved AUC of 0.91 through systematic hyperparameter tuning with Optuna.
- Designed modular feature engineering framework → reduced feature dimensionality by 35%, improved cross-validated F1 by 8 percentage points vs raw feature baseline.
- Integrated SHAP-based explainability and MLflow experiment tracking → reduced model review cycle time by 40% via self-serve feature importance dashboards.

[Enterprise ML Platform | FastAPI, AWS SageMaker, Feast, Redis, Kafka, Docker, MLflow, GitHub Actions]
- Architected real-time feature store using Feast with Redis (online) and S3 (offline) → sub-10ms feature retrieval on SageMaker, reduced feature pipeline duplication across 8 model teams.
- Designed multi-model serving layer on SageMaker with auto-scaling endpoints → routing across 6 model variants, 99.5% uptime over 3-month evaluation, handling peak 2,000 requests/second.
- Built fully automated model deployment pipeline via GitHub Actions + MLflow Model Registry → reduced model promotion time from 3 days to <4 hours with shadow testing, canary rollout, and automated rollback.
`;
