package com.template.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

/**
 * Architecture tests using ArchUnit.
 * Enforces SOLID principles and detects circular dependencies.
 *
 * Matches TypeScript ESLint + Madge implementation for consistency
 * across all languages in the project.
 */
public class ArchitectureTest {

    private static JavaClasses classes;
    private static final String BASE_PACKAGE = "com.template";

    @BeforeAll
    static void setup() {
        classes = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
                .importPackages(BASE_PACKAGE);
    }

    // ============ CIRCULAR DEPENDENCY DETECTION ============
    // Matches: madge --circular (TypeScript)
    // Matches: pydeps (Python)

    @Test
    @DisplayName("No circular dependencies between packages")
    void noCircularDependenciesBetweenPackages() {
        ArchRule rule = slices()
                .matching(BASE_PACKAGE + ".(*)..")
                .should().beFreeOfCycles();

        rule.check(classes);
    }

    @Test
    @DisplayName("No circular dependencies between slices")
    void noCircularDependenciesBetweenSlices() {
        ArchRule rule = SlicesRuleDefinition.slices()
                .matching(BASE_PACKAGE + ".(**)")
                .should().beFreeOfCycles();

        rule.check(classes);
    }

    // ============ DEPENDENCY INVERSION PRINCIPLE ============
    // Matches: ESLint no-new rule + DI patterns

    @Test
    @DisplayName("Services should depend on interfaces, not implementations")
    void servicesShouldDependOnInterfaces() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..service..")
                .should().dependOnClassesThat()
                .resideInAPackage("..repository.impl..")
                .because("Services should depend on repository interfaces (DIP)");

        rule.check(classes);
    }

    @Test
    @DisplayName("Controllers should not directly access repositories")
    void controllersShouldNotAccessRepositories() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..controller..")
                .should().dependOnClassesThat()
                .resideInAPackage("..repository..")
                .because("Controllers should use services, not repositories directly (DIP)");

        rule.check(classes);
    }

    // ============ LAYERED ARCHITECTURE ============
    // Enforces proper dependency direction

    @Test
    @DisplayName("Layered architecture is respected")
    void layeredArchitectureIsRespected() {
        ArchRule rule = layeredArchitecture()
                .consideringAllDependencies()
                .layer("Controllers").definedBy("..controller..")
                .layer("Services").definedBy("..service..")
                .layer("Repositories").definedBy("..repository..")
                .layer("Domain").definedBy("..domain..", "..model..", "..entity..")

                .whereLayer("Controllers").mayNotBeAccessedByAnyLayer()
                .whereLayer("Services").mayOnlyBeAccessedByLayers("Controllers")
                .whereLayer("Repositories").mayOnlyBeAccessedByLayers("Services")
                .whereLayer("Domain").mayBeAccessedByAnyLayer();

        rule.check(classes);
    }

    // ============ INTERFACE SEGREGATION PRINCIPLE ============

    @Test
    @DisplayName("Interfaces should be in separate packages from implementations")
    void interfacesShouldBeSeparateFromImplementations() {
        ArchRule rule = noClasses()
                .that().areInterfaces()
                .should().resideInAPackage("..impl..")
                .because("Interfaces should be separate from implementations (ISP)");

        rule.check(classes);
    }

    // ============ SINGLE RESPONSIBILITY PRINCIPLE ============
    // Note: Method/class size is enforced by Checkstyle

    @Test
    @DisplayName("Utility classes should not be instantiated")
    void utilityClassesShouldNotBeInstantiated() {
        ArchRule rule = classes()
                .that().resideInAPackage("..util..")
                .and().areNotInterfaces()
                .should().haveOnlyPrivateConstructors()
                .because("Utility classes should have private constructors (SRP)");

        rule.check(classes);
    }

    // ============ OPEN/CLOSED PRINCIPLE ============

    @Test
    @DisplayName("Domain classes should be public")
    void domainClassesShouldBePublic() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain..")
                .and().areNotInterfaces()
                .and().areNotAnonymousClasses()
                .should().bePublic()
                .because("Domain classes should have clear visibility (OCP)");

        rule.check(classes);
    }

    // ============ NAMING CONVENTIONS ============

    @Test
    @DisplayName("Service implementations should end with 'ServiceImpl'")
    void serviceImplementationNaming() {
        ArchRule rule = classes()
                .that().resideInAPackage("..service.impl..")
                .and().areNotInterfaces()
                .should().haveSimpleNameEndingWith("ServiceImpl")
                .because("Service implementations should follow naming convention");

        rule.check(classes);
    }

    @Test
    @DisplayName("Repository implementations should end with 'RepositoryImpl'")
    void repositoryImplementationNaming() {
        ArchRule rule = classes()
                .that().resideInAPackage("..repository.impl..")
                .and().areNotInterfaces()
                .should().haveSimpleNameEndingWith("RepositoryImpl")
                .because("Repository implementations should follow naming convention");

        rule.check(classes);
    }

    @Test
    @DisplayName("Controllers should end with 'Controller'")
    void controllerNaming() {
        ArchRule rule = classes()
                .that().resideInAPackage("..controller..")
                .should().haveSimpleNameEndingWith("Controller")
                .because("Controllers should follow naming convention");

        rule.check(classes);
    }
}
