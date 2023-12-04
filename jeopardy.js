//const BASE_NUM_URL = "http://jservice.io/api/";
const URL = `https://jservice.io/api`;
const NUM_QUESTIONS_PER_CAT = 6;
const NUM_CATEGORIES = 5;
// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  let response = await axios.get(`${URL}/categories`, {
    params: { count: "100", offset: 20 },
  });

  let randomCategory = _.sampleSize(response.data, NUM_CATEGORIES);
  let categoryIDs = randomCategory.map((item) => {
    return item.id;
  });
  return categoryIDs;

}

async function getCategoryIds() {
    // Make an API request to get a list of categories
    const response = await axios.get('https://jservice.io/api/categories', {
      params: {
        count: 10,
        offset: Math.floor(Math.random() * 1000), // Offset for randomness
      },
    });

    // Extract the category IDs from the API response
    const categoryIds = response.data.map(category => category.id);

    return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
 async function getCategory(catId) {
  let response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
  let fiveClues = _.sampleSize(response.data, NUM_QUESTIONS_PER_CAT);

  let questionAnswerArray = fiveClues.map((arr) => {
    return {
      question: arr.question,
      answer: arr.answer,
      showing: null,
    };
  });

  let titleClueObj = {
    title: fiveClues[0].category,
    clues: questionAnswerArray,
  };
  return titleClueObj;
}
// async function getCategory(catId) {
//     // Make an API request to get data for the specified category
//     const response = await axios.get(`https://jservice.io/api/category?id=${catId}`);

//     // Extract the category title and clues from the API response
//     const categoryData = {
//       title: response.data.title,
//       clues: response.data.clues.map(clue => ({
//         question: clue.question,
//         answer: clue.answer,
//         showing: null,
//       })),
//     };

//     return categoryData;
// }
// //testing 
// const catId = 2; // Replace with the actual category ID you want to fetch
// getCategory(catId)
//   .then(categoryData => {
//     console.log('Category Data: ', categoryData);
//   });



/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
  
// async function fillTable() {
//   let catagoryRow = $("<tr>");
//   $("thead").append(catagoryRow);

//   for (let i = 0; i < NUM_CATEGORIES; i++) {
//     $("<td>Cat</td>").appendTo(catagoryRow);
//   }

//   for (let y = 0; y < NUM_QUESTIONS; y++) {
//     let questionRow = $("<tr>");
//     $("tbody").append(questionRow);
//     for (let x = 0; x < NUM_CATEGORIES; x++) {
//       let question = $("<td>").text("?").attr("id", `${x}-${y}`);
//       question.appendTo(questionRow);
//     }
//   }
// }
 
async function fillTable() {
  try {
    // Fetch categories from the jService API (You can replace 'URL' with the actual API endpoint)
    const categoriesResponse = await axios.get(`${URL}/categories`, {
      params: {
        count: NUM_CATEGORIES, // Set NUM_CATEGORIES to the number of categories you need
      },
    });

    // Extract category names
    const categories = categoriesResponse.data.map((category) => category.title);

    // Create the table header with category names
    const tableHead = $('#jeopardy thead');
    const headerRow = $('<tr></tr>');

    categories.forEach((categoryName) => {
      const categoryCell = $(`<td>${categoryName}</td>`);
      headerRow.append(categoryCell);
    });

    tableHead.append(headerRow);

    // Create the table body with question cells
    const tableBody = $('#jeopardy tbody');

    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
      const questionRow = $('<tr></tr>');

      categories.forEach(() => {
        // Initially, show a "?" where the question/answer would go
        const questionCell = $('<td>?</td>');

        // Handle click events to reveal the question/answer
        questionCell.on('click', function () {
          revealClue(this);
        });

        questionRow.append(questionCell);
      });

      tableBody.append(questionRow);
    }
  } catch (error) {
    console.error('Error fetching categories: ', error);
  }
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

// function handleClick(evt) {
//     let id = evt.target.id;
//     let [catId, clueId] = id.split("-");
//     let clue = categories[catId].clues[clueId];
  
//     let msg;
  
//     if (!clue.showing) {
//       msg = clue.question;
//       clue.showing = "question";
//     } else if (clue.showing === "question") {
//       msg = clue.answer;
//       clue.showing = "answer";
//     } else {
//       // already showing answer; ignore
//       return
//     }
  
//     // Update text of cell
//     $(`#${catId}-${clueId}`).html(msg);
    
// }

function handleClick(evt) {
  // Get the cell that was clicked
  const cell = evt.target;

  // Check if the cell contains a clue object
  if (cell.clue) {
    // Get the current state from the .showing property
    const currentState = cell.clue.showing;

    // Update the cell content based on the current state
    if (currentState === null) {
      // Show the question and set .showing to "question"
      cell.textContent = cell.clue.question;
      cell.clue.showing = "question";
    } else if (currentState === "question") {
      // Show the answer and set .showing to "answer"
      cell.textContent = cell.clue.answer;
      cell.clue.showing = "answer";
    } else if (currentState === "answer") {
      // If it's currently "answer", ignore the click
      // You can add additional logic here if needed
    }
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

// function showLoadingView() {
//     $("table").show();
//     $(".start").show();

// }

function showLoadingView() {
  // Clear the game board by removing all content from the table body
  $('#jeopardy tbody').empty();

  // Show a loading spinner
  $('#loading-spinner').show();

  // Disable the "Restart" button or change its text to indicate loading
  $('#restart-button').prop('disabled', true).text('Loading...');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    //$("header").hide();
    $("#spin-container").hide();
    $('#restart-button').prop('disabled', false).text('Restart');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catIds = await getCategoryIds();

  categories = [];
  for (let catId of catIds) {
  
    categories.push(await getCategory(catId));
  }
  fillTable();
  for (let i = 0; i < categories.length; i++) {
    console.log(categories);
  }
}

// async function setupAndStart() {
//   let categories = [];
//     let categoryIDs = await getCategoryIds();
//     categoryIDs.forEach(async (id) => {
//       let tempCategory = await getCategory(id);
//       categories.push(tempCategory);
//     });
//     fillTable();
//     for (let i = 0; i < categories.length; i++) {
//       console.log(categories);
//     }
// }

/** On click of start / restart button, set up game. */
$("#start").on("click", setupAndStart);

// TODO

/** On page load, add event handler for clicking clues */
// $(document).ready(function () {
//     alert("Ready!");
// });

$(async function () {
  setupAndStart();
  $("#jeopardy").on("click", "td", handleClick);
});

// $(document).ready(function () {
//   // Add an event handler for clicking clues
//   $('#jeopardy tbody').on('click', 'td', function () {
//     // Call a function to handle the click on clues (e.g., handleClick function)
//     handleClick(this);
//   });
// });

// TODO
