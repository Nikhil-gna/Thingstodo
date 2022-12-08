//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const PORT = process.env.PORT || 3000

const url = `mongodb+srv://NikhilAnand:Nikhil%402003@cluster0.61nolnv.mongodb.net/todolistDB `;

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the mongodb ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//creating mongoose Schema
// mongoose.connect("mongodb+srv://NikhilAnand:Nikhil@2003@cluster0.61nolnv.mongodb.net/todolistDB", {useNewUrlParser: true});
//itemSchema
const itemSchema = {
  name: String
};
//listSchema
const listSchema={
  name:String,
  items:[itemSchema]
};
//creating mongoose mondel
const List = mongoose.model("List",listSchema);
//creating mongoose mondel
const Items = mongoose.model('Item', itemSchema);

const one = new Items ({
  name:" welcome to todo list📃"
});

const three = new Items({
  name:"👈 Hit this to delete an item"
});
const two = new Items({
  name:"Hit the ' + ' Button to add new item.👇"
});

const defaultItems=[one,two,three];
//inserting documents



app.get("/", function(req, res) {

  //reading data form collection
  Items.find({},function(err,founditems){

    if(founditems.length === 0){
      Items.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added defaultItems to database");
        }
      });
      res.render("/");
    }else{
      res.render("list", { listTitle: "Today",newListItems: founditems});
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Items({
    name:itemName
    });

    if (listName === "Today") {
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err,Foundlist){
      Foundlist.items.push(item);
      Foundlist.save();
      res.redirect("/"+listName);
      });
    }
});

//deleting when user hit checkbox
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;

  if(listName === "Today"){
    Items.findByIdAndRemove(checkedItemId,function(err){
      if (!err) {
        console.log("deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,Foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    })

  }
  });


//creating coustom list using express
app.get("/:coustomList",function(req,res){
  const coustomlistname=_.capitalize (req.params.coustomList);


  List.findOne({name:coustomlistname},function(err,Foundlist){
    if(!err){
      if(!Foundlist){
      // console.log("not found");
      const list = new List({
        name:coustomlistname,
        items:defaultItems
      });
       list.save();
       res.redirect("/"+coustomlistname);
    }else{
      // console.log("already exits ");
      res.render("list", { listTitle: Foundlist.name,newListItems: Foundlist.items});

    }}
  });

});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
