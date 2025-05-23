# Inventory Model Analysis

## Overview
This document outlines the core inventory management model for the Brisa Controle de Estoque system. The model is designed to be flexible, scalable, and support both serialized and bulk inventory tracking with custom attributes.

## Core Entities

### Product
- Represents a catalog item that can be stocked
- Belongs to a Type (e.g., "Business Card", "T-Shirt")
- Can have multiple Lots
- Key fields:
  - `id`: Unique identifier
  - `typeId`: Reference to Type
  - `name`: Product name
  - `description`: Product description
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

### Type
- Represents a category or classification of products
- Has many Products
- Has many Attributes through TypeAttribute
- Key fields:
  - `id`: Unique identifier
  - `name`: Type name
  - `description`: Type description

### Attribute
- Represents a custom field that can be associated with Types
- Can be reused across multiple Types
- Key fields:
  - `id`: Unique identifier
  - `name`: Attribute name
  - `description`: Attribute description
  - `dataType`: Type of data (string, number, date, etc.)

### TypeAttribute
- Junction table linking Types and Attributes
- Defines which attributes are available for a Type
- Key fields:
  - `typeId`: Reference to Type
  - `attributeId`: Reference to Attribute
  - `isRequired`: Whether the attribute is mandatory
  - `defaultValue`: Default value for the attribute

### Lot
- Represents a batch of products
- Belongs to one Product
- Has many Items
- Key fields:
  - `id`: Unique identifier
  - `productId`: Reference to Product
  - `lotNumber`: Unique lot identifier
  - `manufacturingDate`: When the lot was produced
  - `expirationDate`: When the lot expires (if applicable)

### Item
- Represents a single serialized unit
- Belongs to one Product and one Lot
- Has one Location
- Has many ItemAttributes
- Key fields:
  - `id`: Unique identifier
  - `productId`: Reference to Product
  - `lotId`: Reference to Lot
  - `locationId`: Reference to Location
  - `serialNumber`: Unique serial number
  - `status`: Current status (enum)
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

### ItemAttribute
- Stores custom attribute values for Items
- Links Items to Attributes
- Key fields:
  - `id`: Unique identifier
  - `itemId`: Reference to Item
  - `attributeId`: Reference to Attribute
  - `value`: The attribute value

### Location
- Represents a physical or logical storage location
- Has many Items
- Key fields:
  - `id`: Unique identifier
  - `name`: Location name
  - `description`: Location description

### InventoryMovement
- Tracks item movements between locations
- Key fields:
  - `id`: Unique identifier
  - `itemId`: Reference to Item
  - `fromLocationId`: Source location
  - `toLocationId`: Destination location
  - `userId`: User who performed the movement
  - `movementType`: Type of movement (enum)
  - `timestamp`: When the movement occurred
  - `notes`: Additional information

### User
- Represents a system user
- Belongs to a Team and has a Role
- Key fields:
  - `id`: Unique identifier
  - `teamId`: Reference to Team
  - `roleId`: Reference to Role
  - `username`: Login username
  - `email`: User email
  - `name`: User's full name

### Team
- Represents a group of users
- Has many Users
- Key fields:
  - `id`: Unique identifier
  - `name`: Team name
  - `description`: Team description

### Role
- Defines user permissions
- Has many Users
- Key fields:
  - `id`: Unique identifier
  - `name`: Role name
  - `description`: Role description
  - `permissions`: List of permissions

### SystemParameter
- Stores system-wide configuration
- Key fields:
  - `id`: Unique identifier
  - `key`: Parameter name
  - `value`: Parameter value
  - `userId`: User who last modified
  - `updatedAt`: Last update timestamp

## Key Relationships

1. **Product Relationships**
   - Product 1---N Lot
   - Product N---1 Type
   - Product 1---N Item

2. **Type Relationships**
   - Type 1---N Product
   - Type N---N Attribute (through TypeAttribute)

3. **Lot Relationships**
   - Lot N---1 Product
   - Lot 1---N Item

4. **Item Relationships**
   - Item N---1 Product
   - Item N---1 Lot
   - Item N---1 Location
   - Item 1---N ItemAttribute

5. **Location Relationships**
   - Location 1---N Item
   - Location 1---N InventoryMovement (as fromLocation)
   - Location 1---N InventoryMovement (as toLocation)

6. **User Relationships**
   - User N---1 Team
   - User N---1 Role
   - User 1---N InventoryMovement

## Design Decisions

1. **Serialized vs Bulk Tracking**
   - Current model focuses on serialized tracking
   - Each Item represents a single unit
   - Future bulk tracking can be added via a Stock table

2. **Custom Attributes**
   - Flexible attribute system via Attribute, TypeAttribute, and ItemAttribute
   - Supports different data types
   - Allows attribute reuse across Types

3. **Location Hierarchy**
   - Locations can have parent locations
   - Supports complex warehouse structures

4. **Multi-team Support**
   - Users belong to Teams
   - Enables multi-tenant functionality

5. **Movement Tracking**
   - Detailed movement history
   - Supports various movement types
   - Links to users and locations

## Future Considerations

1. **Bulk Inventory**
   - Add Stock table for quantity-based tracking
   - Support both serialized and bulk products

2. **Batch Operations**
   - Support moving multiple items in one operation
   - Add batch movement records

3. **Advanced Reporting**
   - Add reporting-specific tables
   - Support complex analytics

4. **Audit Trail**
   - Add detailed change tracking
   - Support compliance requirements

5. **Integration Points**
   - Add tables for external system integration
   - Support API keys and webhooks 