const { tenants, users } = require( "../shared/schema.js" );
const { db } = require( "./db.js" );
const { eq } = require( "drizzle-orm" );

class Storage
{
  // Get all users
  async getAllUsers()
  {
    try
    {
      return await db.select().from( users );
    } catch ( error )
    {
      console.error( 'Error getting users:', error );
      return [];
    }
  }

  // Get all tenants
  async getAllTenants()
  {
    try
    {
      return await db.select().from( tenants );
    } catch ( error )
    {
      console.error( 'Error getting tenants:', error );
      return [];
    }
  }

  // Get user by ID
  async getUser( id )
  {
    try
    {
      const result = await db.select().from( users ).where( eq( users.id, id ) );
      return result[ 0 ];
    } catch ( error )
    {
      console.error( 'Error getting user:', error );
      return undefined;
    }
  }

  // Get user by CPF
  async getUserByCPF( cpf )
  {
    try
    {
      const result = await db.select().from( users ).where( eq( users.cpf, cpf ) );
      return result[ 0 ];
    } catch ( error )
    {
      console.error( 'Error getting user by CPF:', error );
      return undefined;
    }
  }

  // Create user
  async createUser( userData )
  {
    try
    {
      const result = await db.insert( users ).values( userData ).returning();
      return result[ 0 ];
    } catch ( error )
    {
      console.error( 'Error creating user:', error );
      throw error;
    }
  }

  // Upsert user (create or update)
  async upsertUser( userData )
  {
    try
    {
      // Check if user exists
      const existingUser = userData.cpf ? await this.getUserByCPF( userData.cpf ) : null;

      if ( existingUser )
      {
        // Update existing user
        const result = await db
          .update( users )
          .set( userData )
          .where( eq( users.id, existingUser.id ) )
          .returning();
        return result[ 0 ];
      } else
      {
        // Create new user
        return await this.createUser( userData );
      }
    } catch ( error )
    {
      console.error( 'Error upserting user:', error );
      throw error;
    }
  }

  // Get tenant by ID
  async getTenant( id )
  {
    try
    {
      const result = await db.select().from( tenants ).where( eq( tenants.id, id ) );
      return result[ 0 ];
    } catch ( error )
    {
      console.error( 'Error getting tenant:', error );
      return undefined;
    }
  }

  // Create tenant
  async createTenant( tenantData )
  {
    try
    {
      const result = await db.insert( tenants ).values( tenantData ).returning();
      return result[ 0 ];
    } catch ( error )
    {
      console.error( 'Error creating tenant:', error );
      throw error;
    }
  }
}

const storage = new Storage();

module.exports = { Storage, storage };