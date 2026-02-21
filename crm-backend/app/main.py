from dotenv import load_dotenv
load_dotenv()

"""FastAPI application entry point for the CRM system."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, Base
from app.routers import contacts, deals, activities, accounts, leads, pipelines, notes, auth, users, roles, dashboard, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CRM System API",
    description=(
        "A REST API for managing contacts, deals, and activities "
        "in a simple CRM system."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(dashboard.router)
app.include_router(search.router)
app.include_router(contacts.router)
app.include_router(deals.router)
app.include_router(activities.router)
app.include_router(accounts.router)
app.include_router(leads.router)
app.include_router(pipelines.router)
app.include_router(notes.router)


# ── Global exception handler ────────────────────────────────────────────────


#@app.exception_handler(Exception)
#async def global_exception_handler(request: Request, exc: Exception):
#    """Catch-all handler that returns a consistent JSON error response."""
#    return JSONResponse(
#        status_code=500,
#        content={"detail": "An internal server error occurred."},
#    )


# ── Health check ─────────────────────────────────────────────────────────────


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
