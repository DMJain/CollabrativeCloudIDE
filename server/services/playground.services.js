const Playground = require("../models/playground.model");

class PlaygroundService {
  
    static async create(data) {
      const { user, name, image } = data;
  
      try {
        const playground = await Playground.create({
          name,
          user,
          image,
        });
        return playground;
      } catch (err) {
        console.log("Error creating", err);
        throw new Error("Internal Server Error");
      }
    }

    static async getAll(data){
        const { user } = data;

        try{
            const playgrounds = await Playground.find({user})
            return playgrounds;
        }catch(err){
            console.log("Error getting playgrounds", err);
            throw new Error("Internal Server Error");
        }
    }

    static async getOne(data){
        const { id } = data;
        try{
            const playground = await Playground.findOne({_id: id});
            return playground;
        }catch(err){
            console.log("Error getting playground", err);
            throw new Error("Internal Server Error");
        }
    }
  
  }

  
  module.exports = PlaygroundService;