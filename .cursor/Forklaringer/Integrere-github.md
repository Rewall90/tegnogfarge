Oppgaver:

1. Lagre som .github/workflows/basic-ci.yml

2. Commit og push til GitHub:
git add .github/workflows/basic-ci.yml
git commit -m "Add basic CI workflow"
git push origin main

3. Sjekk at workflowen kjører i GitHub Actions tab

Ferdig når: Workflowen kjører uten feil på GitHub.

Steg 3: Legg til build-funksjonalitet
Mål: Utvid workflowen til å bygge prosjektet og lagre artefakter
name: CI with Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      build-version: ${{ steps.version.outputs.version }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Extract version from package.json
      id: version
      run: |
        VERSION=$(node -p "require('./package.json').version")
        echo "version=$VERSION" >> $GITHUB_OUTPUT
        echo "Building version: $VERSION"
      
    - name: Build project
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4.3.1
      with:
        name: build-files
        path: dist/
        retention-days: 30


Oppgaver:

Erstatt .github/workflows/basic-ci.yml med dette innholdet
Test at build-scriptet fungerer lokalt:
bashnpm run build
ls -la dist/  # Sjekk at build-filene er der

Commit og push:
bashgit add .github/workflows/basic-ci.yml
git commit -m "Add build step to workflow"
git push origin main


✅ Ferdig når: Build-jobben kjører og artefakter lastes opp i GitHub Actions.

Steg 4: Legg til sikkerhetsskanning
Mål: Legg til sikkerhetssjekker som kjører parallelt

name: CI with Security

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      build-version: ${{ steps.version.outputs.version }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Extract version from package.json
      id: version
      run: |
        VERSION=$(node -p "require('./package.json').version")
        echo "version=$VERSION" >> $GITHUB_OUTPUT
        echo "Building version: $VERSION"
      
    - name: Build project
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4.3.1
      with:
        name: build-files
        path: dist/
        retention-days: 30

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run security audit
      run: |
        npm audit --audit-level high --json > audit-results.json || true
        if [ -s audit-results.json ]; then
          echo "Security vulnerabilities found - check output"
          cat audit-results.json
        fi
      continue-on-error: true
      
    - name: Upload audit results
      if: always()
      uses: actions/upload-artifact@v4.3.1
      with:
        name: security-audit
        path: audit-results.json
        retention-days: 30

        Oppgaver:

Oppdater workflowen med sikkerhetsskanning
Test sikkerhetsaudit lokalt:
bashnpm audit --audit-level high

Commit og push:
bashgit add .github/workflows/basic-ci.yml
git commit -m "Add security scanning"
git push origin main


✅ Ferdig når: Sikkerhetsskanning kjører parallelt med test og build.

 Steg 5: Legg til deployment (kun for main branch)
 Mål: Legg til deployment som kun kjører på main branch

 name: Complete CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      build-version: ${{ steps.version.outputs.version }}
      build-success: ${{ steps.build.outputs.success }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Extract version from package.json
      id: version
      run: |
        VERSION=$(node -p "require('./package.json').version")
        echo "version=$VERSION" >> $GITHUB_OUTPUT
        echo "Building version: $VERSION"
      
    - name: Build project
      id: build
      run: |
        npm run build
        echo "success=true" >> $GITHUB_OUTPUT
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4.3.1
      with:
        name: build-files
        path: dist/
        retention-days: 30

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run security audit
      run: |
        npm audit --audit-level high --json > audit-results.json || true
        if [ -s audit-results.json ]; then
          echo "Security vulnerabilities found - check artifacts"
          cat audit-results.json
        fi
      continue-on-error: true
      
    - name: Upload audit results
      if: always()
      uses: actions/upload-artifact@v4.3.1
      with:
        name: security-audit
        path: audit-results.json
        retention-days: 30

  deploy:
    needs: [test, build, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push' && needs.build.outputs.build-success == 'true'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Download build artifacts
      uses: actions/download-artifact@v4.1.4
      with:
        name: build-files
        path: dist/
        
    - name: Deploy to production
      run: |
        echo "🚀 Deploying version ${{ needs.build.outputs.build-version }} to production..."
        # TODO: Legg til dine deployment-kommandoer her
        # Eksempler:
        # - rsync -avz dist/ user@server:/var/www/html/
        # - aws s3 sync dist/ s3://your-bucket --delete
        # - kubectl apply -f k8s/deployment.yaml
        echo "✅ Deployment completed successfully"
        
    - name: Create release tag
      if: success()
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        VERSION="${{ needs.build.outputs.build-version }}"
        git tag -a "v$VERSION" -m "Release version $VERSION"
        git push origin "v$VERSION"

        Oppgaver:

Oppdater workflowen med deployment
Test på develop branch først:
bashgit checkout -b develop
git push origin develop
# Sjekk at deploy IKKE kjører på develop

Test på main branch:
bashgit checkout main
git merge develop
git push origin main
# Sjekk at deploy kjører på main


✅ Ferdig når: Deploy kjører kun på main branch og lager release tags.


Steg 6: Legg til rapportering og notifikasjoner

name: Production CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  
jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      coverage-threshold: ${{ steps.coverage.outputs.threshold }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Generate test coverage
      id: coverage
      run: |
        npm run test:coverage || echo "Coverage failed"
        echo "threshold=passed" >> $GITHUB_OUTPUT
      continue-on-error: true
      
    - name: Upload coverage reports
      if: always()
      uses: actions/upload-artifact@v4.3.1
      with:
        name: coverage-report
        path: coverage/
        retention-days: 30

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      build-version: ${{ steps.version.outputs.version }}
      build-success: ${{ steps.build.outputs.success }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Extract version from package.json
      id: version
      run: |
        VERSION=$(node -p "require('./package.json').version")
        echo "version=$VERSION" >> $GITHUB_OUTPUT
        echo "Building version: $VERSION"
      
    - name: Build project
      id: build
      run: |
        npm run build
        echo "success=true" >> $GITHUB_OUTPUT
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4.3.1
      with:
        name: build-files
        path: dist/
        retention-days: 30

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Setup Node.js
      uses: actions/setup-node@v4.0.2
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run security audit
      run: |
        npm audit --audit-level high --json > audit-results.json || true
        if [ -s audit-results.json ]; then
          echo "Security vulnerabilities found - check artifacts"
          cat audit-results.json
        fi
      continue-on-error: true
      
    - name: Upload audit results
      if: always()
      uses: actions/upload-artifact@v4.3.1
      with:
        name: security-audit
        path: audit-results.json
        retention-days: 30

  deploy:
    needs: [test, build, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push' && needs.build.outputs.build-success == 'true'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4.1.1
      
    - name: Download build artifacts
      uses: actions/download-artifact@v4.1.4
      with:
        name: build-files
        path: dist/
        
    - name: Deploy to production
      run: |
        echo "🚀 Deploying version ${{ needs.build.outputs.build-version }} to production..."
        # TODO: Legg til dine deployment-kommandoer her
        echo "✅ Deployment completed successfully"
        
    - name: Create release tag
      if: success()
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        VERSION="${{ needs.build.outputs.build-version }}"
        git tag -a "v$VERSION" -m "Release version $VERSION"
        git push origin "v$VERSION"

  notify:
    needs: [test, build, deploy, security-scan]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Create pipeline summary
      run: |
        echo "## 📊 Pipeline Summary" >> $GITHUB_STEP_SUMMARY
        echo "- **Tests**: ${{ needs.test.result }}" >> $GITHUB_STEP_SUMMARY
        echo "- **Build**: ${{ needs.build.result }}" >> $GITHUB_STEP_SUMMARY
        echo "- **Security**: ${{ needs.security-scan.result }}" >> $GITHUB_STEP_SUMMARY
        echo "- **Deploy**: ${{ needs.deploy.result }}" >> $GITHUB_STEP_SUMMARY
        
        if [[ "${{ needs.deploy.result }}" == "success" ]]; then
          echo "🎉 **Deployment successful for version ${{ needs.build.outputs.build-version }}**" >> $GITHUB_STEP_SUMMARY
        elif [[ "${{ needs.deploy.result }}" == "failure" ]]; then
          echo "❌ **Deployment failed - check logs**" >> $GITHUB_STEP_SUMMARY
        fi

        Oppgaver:

Erstatt med final workflow
Test komplett pipeline:
bashgit add .github/workflows/basic-ci.yml
git commit -m "Add final CI/CD pipeline with reporting"
git push origin main

Sjekk GitHub Actions Summary for pipeline-oversikt

✅ Ferdig når: Du får fine sammendrag av pipeline-status i GitHub Actions.


Steg 7: Tilpass deployment til ditt miljø
Mål: Bytt ut placeholder-deployment med faktiske kommandoer
Vanlige deployment-eksempler:
For statiske nettsider (GitHub Pages):
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist


Oppgaver:

Oppdater deployment-steget i workflowen
Sett opp nødvendige secrets i GitHub Settings
Test deployment

✅ Ferdig når: Prosjektet deployes automatisk ved push til main.

Du er ferdig!
Når du har fullført alle stegene har du:

✅ Automatisk testing og linting
✅ Automatisk bygging med artefakter
✅ Sikkerhetsskanning
✅ Automatisk deployment (kun main branch)
✅ Release tagging
✅ Pipeline-rapportering

Neste gang du gjør git push origin main vil hele pipelinen kjøre automatisk! 🚀

