import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

//This project is incomplete atm

const app = express();
const port = 3000;
// var arrayInputs = [];
// var arrayInputs2 = [];
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://admin-ransike:l6FHWhtVdlXBiXiO@cluster0.0ft29ec.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList!",
});

const item2 = new Item({
  name: "Hit the + button add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

// try{
//     await Item.insertMany(defaultItems);
//     console.log("Successfully saved the default items to Database!")
// } catch(error) {
//     console.log(error);
// }

app.get("/", (req, res) => {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then((result) => {
            console.log("Successfully saved default items to Database");
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        res.render("index.ejs", {listTitle: "Today", displayItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

// app.get("/workToDo", (req, res) => {
//   res.render("workToDo.ejs", { displayItems2: arrayInputs2 });
// });

//Testing this using express custom route
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).exec()
    .then((foundList) => {
      if (!foundList) {
        //Create new List if List foundList does not exist
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/", customListName);
      } else {
        //Show an existing list if exists
        console.log(`Found list = ${foundList.items}`);
        res.render("Index.ejs", {listTitle: foundList.name, displayItems: foundList.items });
      }
      console.log("Successfully found List");
    })
    .catch((err) => {
      console.log(err);
    });
});

//Add new item
app.post("/",async (req, res) => {
  const itemName = req.body["inputField1"];
  const listName = req.body.list;

  

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    console.log(`itemName = ${itemName}, listName = ${listName}`);
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({ name: listName }).exec().then(foundList => {

        foundList.items.push(item)
        foundList.save()
        res.redirect("/" + listName)
    }).catch(err => {
        console.log(err);
    });
  }
});

app.post("/delete", (req, res) => {
  console.log("Delete Function = " + req.body.checkbox);
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndDelete(itemId)
    .then((result) => {
      console.log("Successfully deleted an item");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });

    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}})
        .then((foundList) => {
            res.redirect("/" + listName);
        });
    }  
});

app.listen(port, () => {
  console.log(`Listening on the port ${port}`);
});
