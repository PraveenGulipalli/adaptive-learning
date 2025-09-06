""
WSGI config for Railway deployment.
It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from app.main import app

# This is used by Railway to run your application
application = app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
