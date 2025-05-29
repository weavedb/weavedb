use std::collections::HashMap;
use base64::engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD};
use base64::Engine;
use openssl::hash::MessageDigest;
use openssl::pkey::PKey;
use openssl::rsa::Rsa;
use openssl::sign::Verifier;

/// Verifies an HTTP message signature according to RFC 9421
/// 
/// This function expects a JSON string containing HTTP headers, including:
/// - `signature-input`: Contains the signature label, covered components, and parameters
/// - `signature`: Contains the actual signature value
/// 
/// The signature is verified using RSA-PSS-SHA512 with the RSA public key 
/// extracted from the `keyid` parameter.
pub fn verify_signature(headers_json: &str) -> Result<(), String> {
    let headers: HashMap<String, String> = serde_json::from_str(headers_json)
        .map_err(|e| format!("Failed to parse headers JSON: {}", e))?;

    let sig_input = headers
        .get("signature-input")
        .ok_or("Missing signature-input header")?;
    let sig_header = headers
        .get("signature")
        .ok_or("Missing signature header")?;

    // Parse the signature-input header: "label=(fields);params"
    let (sig_label, fields, raw_params) = parse_signature_input(sig_input)?;
    
    // Extract the signature value for this label
    let signature_bytes = extract_signature_value(sig_header, &sig_label)?;
    
    // Build the signature base string according to RFC 9421
    let signing_string = build_signature_base(&headers, &fields, raw_params)?;
    
    // Extract the RSA public key from the keyid parameter
    let public_key = extract_rsa_public_key(sig_input)?;
    
    // Verify the signature using OpenSSL (matches Node.js behavior)
    verify_signature_openssl(&public_key, &signing_string, &signature_bytes)
}

/// Parses the signature-input header to extract label, fields, and parameters
fn parse_signature_input(sig_input: &str) -> Result<(String, Vec<String>, &str), String> {
    let equals_pos = sig_input
        .find('=')
        .ok_or("Invalid signature-input format: missing '='")?;
    let sig_label = sig_input[..equals_pos].to_string();
    
    let input_start = sig_input
        .find('(')
        .ok_or("Invalid signature-input format: missing '('")?;
    let input_end = sig_input
        .find(')')
        .ok_or("Invalid signature-input format: missing ')'")?;
    
    let fields_str = &sig_input[input_start + 1..input_end];
    let fields: Vec<String> = fields_str
        .split_whitespace()
        .map(|s| s.trim_matches('"').to_string())
        .collect();
    
    let raw_params = &sig_input[equals_pos + 1..];
    
    Ok((sig_label, fields, raw_params))
}

/// Extracts the signature value for the given label from the signature header
fn extract_signature_value(sig_header: &str, sig_label: &str) -> Result<Vec<u8>, String> {
    let label_prefix = format!("{}=:", sig_label);
    let sig_start = sig_header
        .find(&label_prefix)
        .ok_or("Signature label not found in signature header")?;
    let sig_value_start = sig_start + label_prefix.len();
    
    let remaining = &sig_header[sig_value_start..];
    let sig_end = remaining
        .find(':')
        .ok_or("Signature value not properly terminated with ':'")?;
    let b64_signature = &remaining[..sig_end];
    
    STANDARD
        .decode(b64_signature)
        .map_err(|e| format!("Failed to decode base64 signature: {}", e))
}

/// Builds the signature base string according to RFC 9421 format
fn build_signature_base(
    headers: &HashMap<String, String>,
    fields: &[String],
    raw_params: &str,
) -> Result<String, String> {
    let mut signing_string = String::new();

    // Add each covered component in the format: "field-name": value\n
    for field in fields {
        let value = headers
            .get(field)
            .ok_or_else(|| format!("Missing header field: {}", field))?;
        signing_string.push_str(&format!("\"{}\": {}\n", field.to_lowercase(), value));
    }

    // Add the signature parameters line (no trailing newline)
    signing_string.push_str(&format!("\"@signature-params\": {}", raw_params));
    
    Ok(signing_string)
}

/// Extracts the RSA public key from the keyid parameter in signature-input
fn extract_rsa_public_key(sig_input: &str) -> Result<PKey<openssl::pkey::Public>, String> {
    let key_id_start = sig_input
        .find("keyid=\"")
        .ok_or("Missing keyid parameter")?;
    let key_id_end = sig_input[key_id_start + 7..]
        .find('"')
        .ok_or("Malformed keyid parameter")?;
    let key_id = &sig_input[key_id_start + 7..key_id_start + 7 + key_id_end];
    
    // Decode the keyid as base64url-encoded RSA modulus (n)
    let n_bytes = URL_SAFE_NO_PAD
        .decode(key_id)
        .map_err(|e| format!("Failed to decode keyid: {}", e))?;
    
    // Standard RSA exponent (65537)
    let e_bytes = URL_SAFE_NO_PAD
        .decode("AQAB")
        .map_err(|e| format!("Failed to decode RSA exponent: {}", e))?;
    
    // Create RSA key from components (matches JWK format)
    let rsa = Rsa::from_public_components(
        openssl::bn::BigNum::from_slice(&n_bytes)
            .map_err(|e| format!("Failed to create BigNum from modulus: {}", e))?,
        openssl::bn::BigNum::from_slice(&e_bytes)
            .map_err(|e| format!("Failed to create BigNum from exponent: {}", e))?,
    )
    .map_err(|e| format!("Failed to create RSA key: {}", e))?;
    
    PKey::from_rsa(rsa).map_err(|e| format!("Failed to create PKey: {}", e))
}

/// Verifies the signature using OpenSSL with RSA-PSS-SHA512
fn verify_signature_openssl(
    public_key: &PKey<openssl::pkey::Public>,
    signing_string: &str,
    signature_bytes: &[u8],
) -> Result<(), String> {
    let mut verifier = Verifier::new(MessageDigest::sha512(), public_key)
        .map_err(|e| format!("Failed to create verifier: {}", e))?;
    
    // Configure RSA-PSS padding (matches Node.js RSA_PKCS1_PSS_PADDING)
    verifier
        .set_rsa_padding(openssl::rsa::Padding::PKCS1_PSS)
        .map_err(|e| format!("Failed to set PSS padding: {}", e))?;
    
    // Set MGF1 hash function to SHA-512 (matches Node.js defaults)
    verifier
        .set_rsa_mgf1_md(MessageDigest::sha512())
        .map_err(|e| format!("Failed to set MGF1 hash function: {}", e))?;
    
    // Update verifier with the signing string
    verifier
        .update(signing_string.as_bytes())
        .map_err(|e| format!("Failed to update verifier: {}", e))?;
    
    // Verify the signature
    match verifier.verify(signature_bytes) {
        Ok(true) => Ok(()),
        Ok(false) => Err("Signature verification failed: signature does not match".to_string()),
        Err(e) => Err(format!("Signature verification error: {}", e)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_verifies_signature() {
        let json_str = std::fs::read_to_string("test/sample_headers.json")
            .expect("Failed to load test headers JSON file");
        
        verify_signature(&json_str)
            .expect("Signature verification should succeed");
    }
}
