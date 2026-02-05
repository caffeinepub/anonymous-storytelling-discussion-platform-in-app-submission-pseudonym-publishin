# Deployment Guide

This guide covers deployment procedures, troubleshooting, and verification steps for the Genuine-Being Real application on the Internet Computer.

## Understanding Canister IDs

Your application uses **two separate canisters**:

1. **Frontend (Asset) Canister** - Serves the website (HTML, CSS, JavaScript)
2. **Backend (API) Canister** - Handles data storage and business logic

⚠️ **Important**: When accessing your website, you must use the **frontend canister ID**, not the backend canister ID. Using the backend canister ID in a browser will result in "Canister ID Not Resolved" or routing errors.

## Quick Deployment

### Local Development

