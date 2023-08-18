const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});
mongoose.set("strictQuery",false);

app.set("view engine","ejs"); /*to use ejs*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("style"));

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name : "Hello"
});

const item2 = new Item ({
  name : "World"
});

const item3 = new Item ({
  name : "Good Morning"
});

const defaultItems = [item1,item2,item3];

const listSchema = mongoose.Schema({

  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.post("/",function(req,res){

  const itemName = req.body.item;
  const listName = req.body.list;

  const itemnew = new Item({
    name: itemName
  });

  if(listName==="Today")
  {
    itemnew.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,result){
      result.items.push(itemnew);
      result.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){

  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItem,function(err){
      console.log(err);
    });
    res.redirect("/");
  }
  else{

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,result){

      if(!err)
      {
        console.log("Successfull");
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.find({name: customListName},function(err,result){

    if(!err)
    {
        if(result.length===0)
        {
          console.log("Doesn't exist");
          const list = new List({
            name: customListName,
            items: defaultItems
          });
           list.save();
           res.redirect("/"+customListName);
        }
        else
        {
          res.render("list",{listTitle:customListName,newlistitem:result[0].items});
        }
    }
  });


});
app.get("/",function(req,res){

  Item.find({},function(err,results){

      if(results.length===0)
      {
        Item.insertMany(defaultItems,function(err)
        {
          if(err)
          {
            console.log(err);
          }
          else
          {
            console.log("Successfull");
          }
        });
      }
      res.render("list", {listTitle:"Today",newlistitem:results});
  })
});

app.listen(3000,function(){

  console.log("Server started at port 3000");
});
