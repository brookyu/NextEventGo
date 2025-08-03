package main

import (
	"fmt"
	"go/parser"
	"go/token"
	"log"
	"os"
	"path/filepath"
	"strings"
)

// MigrationVerifier verifies the migration was successful
type MigrationVerifier struct {
	projectRoot string
	errors      []string
	warnings    []string
}

// NewMigrationVerifier creates a new migration verifier
func NewMigrationVerifier(projectRoot string) *MigrationVerifier {
	return &MigrationVerifier{
		projectRoot: projectRoot,
		errors:      []string{},
		warnings:    []string{},
	}
}

// VerifyMigration runs all verification checks
func (mv *MigrationVerifier) VerifyMigration() error {
	fmt.Println("🔍 Starting Migration Verification...")
	fmt.Println("=====================================")

	// 1. Verify directory structure
	if err := mv.verifyDirectoryStructure(); err != nil {
		return fmt.Errorf("directory structure verification failed: %w", err)
	}

	// 2. Verify import paths
	if err := mv.verifyImportPaths(); err != nil {
		return fmt.Errorf("import path verification failed: %w", err)
	}

	// 3. Verify entity definitions
	if err := mv.verifyEntityDefinitions(); err != nil {
		return fmt.Errorf("entity definition verification failed: %w", err)
	}

	// 4. Verify no duplicate files
	if err := mv.verifyNoDuplicates(); err != nil {
		return fmt.Errorf("duplicate file verification failed: %w", err)
	}

	// 5. Print results
	mv.printResults()

	if len(mv.errors) > 0 {
		return fmt.Errorf("migration verification failed with %d errors", len(mv.errors))
	}

	fmt.Println("✅ Migration verification completed successfully!")
	return nil
}

// verifyDirectoryStructure checks the project structure
func (mv *MigrationVerifier) verifyDirectoryStructure() error {
	fmt.Println("📁 Verifying directory structure...")

	// Check that main internal directory exists
	internalDir := filepath.Join(mv.projectRoot, "internal")
	if _, err := os.Stat(internalDir); os.IsNotExist(err) {
		mv.errors = append(mv.errors, "main internal/ directory does not exist")
		return nil
	}

	// Check that backend/internal does not exist
	backendInternalDir := filepath.Join(mv.projectRoot, "backend", "internal")
	if _, err := os.Stat(backendInternalDir); !os.IsNotExist(err) {
		mv.errors = append(mv.errors, "backend/internal/ directory still exists - should be removed")
	}

	// Check required subdirectories
	requiredDirs := []string{
		"internal/domain",
		"internal/domain/entities",
		"internal/domain/repositories",
		"internal/infrastructure",
		"internal/infrastructure/repositories",
	}

	for _, dir := range requiredDirs {
		fullPath := filepath.Join(mv.projectRoot, dir)
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			mv.errors = append(mv.errors, fmt.Sprintf("required directory %s does not exist", dir))
		}
	}

	// Check that required files exist
	requiredFiles := []string{
		"internal/domain/entities/user.go",
		"internal/domain/entities/site_image.go",
		"internal/domain/entities/news.go",
		"internal/domain/repositories/news_repository.go",
		"internal/infrastructure/repositories/gorm_news_repository.go",
		"internal/infrastructure/database.go",
	}

	for _, file := range requiredFiles {
		fullPath := filepath.Join(mv.projectRoot, file)
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			mv.errors = append(mv.errors, fmt.Sprintf("required file %s does not exist", file))
		}
	}

	fmt.Println("   ✅ Directory structure verification completed")
	return nil
}

// verifyImportPaths checks that all import paths are consistent
func (mv *MigrationVerifier) verifyImportPaths() error {
	fmt.Println("📦 Verifying import paths...")

	expectedModule := "github.com/zenteam/nextevent-go"
	invalidImports := []string{}

	err := filepath.Walk(filepath.Join(mv.projectRoot, "internal"), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !strings.HasSuffix(path, ".go") {
			return nil
		}

		// Parse the Go file
		fset := token.NewFileSet()
		node, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if err != nil {
			mv.warnings = append(mv.warnings, fmt.Sprintf("could not parse %s: %v", path, err))
			return nil
		}

		// Check imports
		for _, imp := range node.Imports {
			importPath := strings.Trim(imp.Path.Value, `"`)

			// Check for old backend imports
			if strings.Contains(importPath, "backend/internal") {
				invalidImports = append(invalidImports, fmt.Sprintf("%s: %s", path, importPath))
			}

			// Check for inconsistent module names
			if strings.Contains(importPath, "nextevent-go") && !strings.HasPrefix(importPath, expectedModule) {
				invalidImports = append(invalidImports, fmt.Sprintf("%s: inconsistent module name %s", path, importPath))
			}
		}

		return nil
	})

	if err != nil {
		return err
	}

	if len(invalidImports) > 0 {
		mv.errors = append(mv.errors, "Invalid import paths found:")
		for _, imp := range invalidImports {
			mv.errors = append(mv.errors, "  "+imp)
		}
	}

	fmt.Println("   ✅ Import path verification completed")
	return nil
}

// verifyEntityDefinitions checks that entities are properly defined
func (mv *MigrationVerifier) verifyEntityDefinitions() error {
	fmt.Println("🏗️  Verifying entity definitions...")

	// Check that key entities exist and have required methods
	entityChecks := map[string][]string{
		"internal/domain/entities/user.go": {
			"type User struct",
			"func (User) TableName()",
			"BeforeCreate",
		},
		"internal/domain/entities/site_image.go": {
			"type SiteImage struct",
			"func (SiteImage) TableName()",
			"BeforeCreate",
		},
		"internal/domain/entities/news.go": {
			"type News struct",
			"type NewsCategory struct",
			"func (News) TableName()",
			"BeforeCreate",
		},
	}

	for filePath, requiredContent := range entityChecks {
		fullPath := filepath.Join(mv.projectRoot, filePath)
		content, err := os.ReadFile(fullPath)
		if err != nil {
			mv.errors = append(mv.errors, fmt.Sprintf("could not read %s: %v", filePath, err))
			continue
		}

		fileContent := string(content)
		for _, required := range requiredContent {
			if !strings.Contains(fileContent, required) {
				mv.errors = append(mv.errors, fmt.Sprintf("%s missing required content: %s", filePath, required))
			}
		}
	}

	fmt.Println("   ✅ Entity definition verification completed")
	return nil
}

// verifyNoDuplicates checks for duplicate files or directories
func (mv *MigrationVerifier) verifyNoDuplicates() error {
	fmt.Println("🔍 Verifying no duplicate files...")

	// Check for common duplicate patterns
	duplicateChecks := []string{
		"backend/internal",
		"internal/domain/entities/image.go", // Should be removed in favor of site_image.go
	}

	for _, duplicate := range duplicateChecks {
		fullPath := filepath.Join(mv.projectRoot, duplicate)
		if _, err := os.Stat(fullPath); !os.IsNotExist(err) {
			mv.errors = append(mv.errors, fmt.Sprintf("duplicate file/directory found: %s", duplicate))
		}
	}

	fmt.Println("   ✅ Duplicate verification completed")
	return nil
}

// printResults prints the verification results
func (mv *MigrationVerifier) printResults() {
	fmt.Println("\n📊 Migration Verification Results")
	fmt.Println("==================================")

	if len(mv.errors) == 0 && len(mv.warnings) == 0 {
		fmt.Println("✅ All checks passed! Migration was successful.")
		return
	}

	if len(mv.errors) > 0 {
		fmt.Printf("❌ Found %d errors:\n", len(mv.errors))
		for i, err := range mv.errors {
			fmt.Printf("   %d. %s\n", i+1, err)
		}
		fmt.Println()
	}

	if len(mv.warnings) > 0 {
		fmt.Printf("⚠️  Found %d warnings:\n", len(mv.warnings))
		for i, warning := range mv.warnings {
			fmt.Printf("   %d. %s\n", i+1, warning)
		}
		fmt.Println()
	}

	// Print summary
	fmt.Println("📋 Summary:")
	if len(mv.errors) == 0 {
		fmt.Println("✅ Migration verification PASSED")
	} else {
		fmt.Println("❌ Migration verification FAILED")
		fmt.Println("   Please fix the errors above before proceeding.")
	}
}

func main() {
	// Get project root (assume script is run from project root or scripts directory)
	projectRoot, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get current directory: %v", err)
	}

	// If we're in the scripts directory, go up one level
	if strings.HasSuffix(projectRoot, "scripts") {
		projectRoot = filepath.Dir(projectRoot)
	}

	// Create verifier and run verification
	verifier := NewMigrationVerifier(projectRoot)
	if err := verifier.VerifyMigration(); err != nil {
		log.Fatalf("Migration verification failed: %v", err)
	}
}
