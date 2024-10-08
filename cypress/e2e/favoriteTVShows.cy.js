describe("Favorite TV shows on The Movie Database", () => {
    // Get username and password from cypress env
    const username = Cypress.env("username");
    const password = Cypress.env("password");
  
    before(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
      // Perform login
      cy.tmdbLogin(username, password)
  
      // Get cookie
      cy.getCookies().then((cookies) => {
        
      // Save the cookies to be used for future requests
      cy.writeFile("cypress/fixtures/cookies.json", JSON.stringify(cookies));
      });
  
      // Verify language should in english
      cy.get("header > div.content > div > div.flex > ul > li.translate > div").should("contain", "en");
      
      // Load url fixtures
      cy.fixture("urls").then((urlsFixture) => {
        Cypress.urlsFixture = urlsFixture;
      });

      // Load tv shows name data
      cy.fixture("tvShowData").then((tvShowNames) => {
        Cypress.tvShowNames = tvShowNames;
      });
    });
  
    beforeEach(() => {
        // Set cookie for each test using custom command
        cy.setLoginSession();
      });
  
    context("When marks a tv show as favorite", () => {
      it("should add a tv show to user's favorite TV shows list", () => {
        cy.visit(Cypress.urlsFixture.baseUrl);
  
        // Navigate to movies list 
        // Input first parameter with TV Shows
        // Input second parameter with Popular, Airing Today, Top Rated, or On TV 
        cy.navigateToMovieOrTVList("TV Shows", "Top Rated");
        // Verify url
        cy.url().should("eq", Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.tv);
  
        // Visit movie detail page
        cy.visitMovieDetail("One Piece");
        cy.url().should("contain", "37854");
  
        // Marks movie as favorite
        cy.get("#favourite").click();
  
        cy.get("#favourite > span").should("have.class", "true");
      });
  
      it("should display TV show added in the user's favorite TV shows section on the profile page", () => {
        cy.visit(Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.favoritesTV)
  
        // Verify movie name existed
        cy.contains("One Piece").should("exist");
  
        // Verify if movie contain image and movie detail
        cy.get(".card")
          .find(".image")
          .should("exist");
        cy.get(".card")
          .find(".details")
          .should("exist");
  
        // Verify if display correct counter
        cy.get("[data-media-type='tv']").should("contain", "1")
      });
    });
  
    context("When user remove a TV show from favortie list", () => {
        it("should display correct TV show counter", () => {
            cy.visit(Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.favoritesTV);
            cy.contains("Remove").click();
  
            // Reload the page
            cy.reload();

            cy.wait(1000);

            // Verify if display correct counter
            cy.get("[data-media-type='tv']").should("contain", "0")
          });

        it("should be able to remove TV show from favorite list", () => {
            cy.visit(Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.favoritesTV);
            cy.contains("One Piece").should("not.exist");
          });
    })
  
    context("When marks multiple TV shows as favorite", () => {
  
      it("should add multiple to user's favorite movies list", () => {
        cy.visit(Cypress.urlsFixture.baseUrl);
  
        // Navigate to movies list 
        // Input first parameter with Movies
        // Input second parameter with Popular, Now Playing, Top Rated, or Upcoming 
        cy.navigateToMovieOrTVList("TV Shows", "Top Rated");
  
        // Verify url
        cy.url().should("eq", Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.tv);
  
        Cypress.tvShowNames.forEach((show) => {
  
          // Visit movie detail page
          cy.visitMovieDetail(show);
         
          // Marks movie as favorite
          cy.get("#favourite").click();
  
          cy.get("#favourite > span").should("have.class", "true");  
          
          // Back to movie list page
          cy.go(-1);
        });
      });
  
      it("should be added to the user's favorite TV show list", () => {
        cy.visit(Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.favoritesTV);
  
        // Verify if list have 3 movies in it
        cy.get(".results_page")
          .children()
          .should("have.length", 3);
        
        // Verify if movie name existed in the list
        Cypress.tvShowNames.forEach((show) => {
          cy.contains(show).should("exist");
        });
  
        cy.get("[data-media-type='tv']").should("contain", "3")
      });
  
      it("should display TV Shows order by release date in descending order (most recent to oldest", () => {
        cy.visit(Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.favoritesTV + Cypress.urlsFixture.orderByParam + Cypress.urlsFixture.orderTypeParam);

        const movieData = [];
        const sortedMovieData = [];

        // Get title and release date text
        cy.get(".card.v4").each(($card) => {
            const title = $card.find(".title h2").text();
            const releaseDate = $card.find('.release_date').text();

            // Add title and release date to the movieData array
          movieData.push({ title, releaseDate });
        });

        // Sort movie by release date in descending order
        cy.sortByReleaseDateDesc(sortedMovieData);

        // Compare movie data and sorted movie data
        expect(movieData).to.deep.equal(sortedMovieData);
      });
  
      it("should be able remove TV show from favorite", () => {
        cy.visit(Cypress.urlsFixture.baseUrl + Cypress.urlsFixture.favoritesTV);
        cy.get(".results_page")
          .find(".remove_list_item")
          .each(($el) => {
            cy.wrap($el).click();
          });
  
          Cypress.tvShowNames.forEach((show) => {
          cy.contains(show).should("not.exist");
        });
      });
    });  
  });